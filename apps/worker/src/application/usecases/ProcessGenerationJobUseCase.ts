import type {
    IAiApiRepository,
    IGenerationJobRepository,
    ILeadRepository,
    IWorkspaceRepository,
    // IGeneratedEmailRepository // এটি আপনার প্রোজেক্টে থাকলে ইমপোর্ট করে নিবেন
} from "@repo/ports";
import type { AiProvider, GenerationJobStatus } from "@repo/db";
import type { AiProviderFactory } from "@repo/infrastructure/ai";
import { coldEmailPrompt } from "../../prompts/cold-email.prompt";
import { isErrorResponse } from "../../utils/isErrorResponse";
import { quotaResetQueue } from "@repo/queue";

export class ProcessGenerationUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository,
        private readonly leadRepository: ILeadRepository,
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly aiApiRepository: IAiApiRepository,
        private readonly aiProviderFactory: AiProviderFactory,
        // private readonly generatedEmailRepository: IGeneratedEmailRepository // ইমেইল সেভ করার জন্য
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

        let apis = await this.aiApiRepository.findAvailableByOwnerId(workspace.ownerId);

        console.log(`Running process for Job: ${jobId}. Total pending leads: ${leads.length}`);

        if (leads.length === 0) {
            console.log(`Job ${jobId} already finished.`);
            await this.generationJobRepository.updateStatusById(jobId, "COMPLETED");
            return;
        }


        if (apis.length === 0) {
            await this.generationJobRepository.updateStatusById(jobId, "FAILED", "No API key found");
            return console.log("No API key found")
        }


        await this.generationJobRepository.updateStatusById(jobId, "PROCESSING");

        let successCount = 0;
        let failedCount = 0;

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (const lead of leads) {

            let generated = false;

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

                                await quotaResetQueue.add(
                                    "reset-api-key-status",
                                    { apiKeyId: api.id },
                                    {
                                        delay: 60 * 60 * 1000,
                                        jobId: `reset-${api.id}`,
                                        removeOnComplete: true,
                                        removeOnFail: true,
                                    }
                                );


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
                    console.log(response)
                    const cleanedResponse = response
                        .replace(/^```json\s*/i, "")
                        .replace(/^```\s*/i, "")
                        .replace(/\s*```$/, "")
                        .trim();

                    const emailData = JSON.parse(cleanedResponse);

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

                    generated = true;

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

        if (failedCount === leads.length) {
            finalStatus = "FAILED";
        } else if (successCount === leads.length) {
            finalStatus = "COMPLETED";
        } else {
            finalStatus = "WAITING_FOR_API_QUOTA";
        }
        await this.generationJobRepository.updateStatusById(jobId, finalStatus);

        console.log(`Job ${jobId} finished. Success: ${successCount}, Failed: ${failedCount}`);
    }
}