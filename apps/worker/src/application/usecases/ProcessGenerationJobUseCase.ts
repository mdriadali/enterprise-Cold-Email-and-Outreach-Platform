import type {
    IAiApiRepository,
    IGenerationJobRepository,
    ILeadRepository,
    IWorkspaceRepository,
} from "@repo/ports";
import type { AiProvider, GenerationJobStatus } from "@repo/db";
import type { AiProviderFactory } from "@repo/infrastructure/ai";
import { coldEmailPrompt } from "../../infrastructure/prompts/cold-email.prompt";
import { isErrorResponse } from "../../utils/isErrorResponse";
import { resetApiStatusQueue } from "@repo/queue";
import { logger } from "../../logger";

export class ProcessGenerationUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository,
        private readonly leadRepository: ILeadRepository,
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly aiApiRepository: IAiApiRepository,
        private readonly aiProviderFactory: AiProviderFactory,
    ) { }

    async execute(jobId: string): Promise<void> {

        const job = await this.generationJobRepository.findById(jobId);

        if (!job) {
            logger.warn({ jobId }, "Job not found");
            return;
        }

        const leads = await this.leadRepository.findPendingByJobId(jobId);
        const workspace = await this.workspaceRepository.findById(job.workspaceId);

        if (!workspace) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "Workspace not found");
            logger.warn({ jobId }, "Workspace not found");
            return
        }

        if (leads.length === 0) {
            await this.generationJobRepository.updateStatusById(jobId, "COMPLETED");
            logger.info({ jobId }, "Job already finished, no pending leads");
            return;
        }

        const apiSummary = await this.aiApiRepository.getApiSummary(workspace.id)

        if (apiSummary.total === 0) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "No API key found");
            logger.warn({ jobId }, "No API key found");
            return;
        }

        if (apiSummary.invalid === apiSummary.total) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "All Api Key Invalid");
            logger.warn({ jobId }, "All API keys invalid");
            return;
        }

        if (apiSummary.available === 0 && apiSummary.rateLimited > 0) {
            await this.generationJobRepository.updateStatusById(jobId, "WAITING_FOR_API_QUOTA", "Watting For Api Quota");
            logger.warn({ jobId }, "Waiting for API quota");
            return;
        }
        let apis = await this.aiApiRepository.findAvailableByWorkspaceId(workspace.id);

        await this.generationJobRepository.updateStatusById(jobId, "PROCESSING");

        let successCount = 0;
        let failedCount = 0;
        let apiLength = apis.length
        let reateLimit = 0

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (const lead of leads) {

            while (apis.length > 0) {

                const api = apis.shift()!;

                try {

                    const provider = this.aiProviderFactory.get(
                        api.aiProvider as AiProvider
                    );

                    const prompt = coldEmailPrompt(lead);

                    const response = await provider.generate(
                        api.apiKey,
                        prompt
                    );

                    if (isErrorResponse(response)) {

                        switch (response.error.type) {

                            case "RATE_LIMIT":
                                await this.aiApiRepository.updateStatus(
                                    api.id,
                                    "RATE_LIMITED"
                                );

                                await resetApiStatusQueue.add(
                                    "reset-api-key-status",
                                    { apiKeyId: api.id },
                                    {
                                        delay: 60 * 60 * 1000,
                                        jobId: `reset-${api.id}`,
                                        removeOnComplete: true,
                                        removeOnFail: true,
                                    }
                                );

                                reateLimit++

                                continue;

                            case "INVALID_API_KEY":
                                await this.aiApiRepository.updateStatus(
                                    api.id,
                                    "INVALID"
                                );
                                continue;

                            case "SERVICE_UNAVAILABLE":

                                apis.push(api);
                                continue;

                            default:
                                apis.push(api);
                                continue;
                        }
                    }

                    let emailData

                    try {
                        const cleanedResponse = response
                            .replace(/^```json\s*/i, "")
                            .replace(/^```\s*/i, "")
                            .replace(/\s*```$/, "")
                            .trim();

                        emailData = JSON.parse(cleanedResponse);
                    } catch (error) {
                        continue
                    }


                    await this.leadRepository.updateGeneratedEmailData(
                        lead.id,
                        emailData
                    );

                    await this.leadRepository.updateStatusById(
                        lead.id,
                        "GENERATED"
                    );

                    successCount++;


                    apis.push(api);

                    await delay(4000);

                    break;

                } catch (error) {

                    logger.error({ jobId, leadId: lead.id, error }, "Failed to generate email for lead");

                    failedCount++;

                    apis.push(api);

                    break;
                }
            }

        }

        let finalStatus: GenerationJobStatus;

        if (successCount === leads.length) {
            finalStatus = "COMPLETED";
        } else if (reateLimit === apiLength) {
            finalStatus = "WAITING_FOR_API_QUOTA";
        } else {
            finalStatus = "FAILED";
        }

        await this.generationJobRepository.updateStatusById(jobId, finalStatus);

        logger.info({ jobId, successCount, failedCount }, "Job finished");
    }
}
