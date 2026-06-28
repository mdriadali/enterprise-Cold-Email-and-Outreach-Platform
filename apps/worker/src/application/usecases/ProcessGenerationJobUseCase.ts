import type {
    IAiApiRepository,
    IGenerationJobRepository,
    ILeadRepository,
    IWorkspaceRepository,
} from "@repo/ports";
import type { AiProvider, GenerationJobStatus } from "@repo/db";
import type { AiProviderFactory } from "@repo/infrastructure/ai";
import { coldEmailPrompt } from "../../prompts/cold-email.prompt";
import { isErrorResponse } from "../../utils/isErrorResponse";
import { resetApiStatusQueue } from "@repo/queue";

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
            return console.log(`Job not found with ID: ${jobId}`)
        }

        const leads = await this.leadRepository.findPendingByJobId(jobId);
        const workspace = await this.workspaceRepository.findById(job.workspaceId);

        if (!workspace) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "Workspace not found");
            console.log("Workspace not found Job Id :", jobId)
            return
        }

        if (leads.length === 0) {
            console.log(`Job ${jobId} Already finished.`);
            await this.generationJobRepository.updateStatusById(jobId, "COMPLETED");
            return;
        }

        const apiSummary = await this.aiApiRepository.getApiSummary(workspace.ownerId)


        console.log(`Running process for Job: ${jobId}. Total pending leads: ${leads.length}`);

        if (apiSummary.total === 0) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "No API key found");
            return console.log("No API key found")
        }

        if (apiSummary.invalid === apiSummary.total) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "All Api Key Invalid");
            return console.log("All Api Key Invalid")
        }

        if (apiSummary.available === 0 && apiSummary.rateLimited > 0) {
            await this.generationJobRepository.updateStatusById(jobId, "WAITING_FOR_API_QUOTA", "Watting For Api Quota");
            return console.log("Watting For Api Quota")
        }
        let apis = await this.aiApiRepository.findAvailableByOwnerId(workspace.ownerId);



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
                    console.log("lead generated jobid :", jobId)
                    // console.log(response)

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

                    console.error(error);

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

        console.log("successCount:", successCount)
        console.log("failedCount:", failedCount)
        await this.generationJobRepository.updateStatusById(jobId, finalStatus);

        console.log(`Job ${jobId} finished. Success: ${successCount},  Failed: ${failedCount}`);
    }
}