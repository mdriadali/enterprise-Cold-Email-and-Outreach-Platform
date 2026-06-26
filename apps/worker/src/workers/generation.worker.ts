import { Worker } from "bullmq";
import { redisConnectionConfig } from "@repo/queue";
import { prosessGenerationUseCase } from "../container/processgeneration-usecase-dependencies";
import { generationJobRepository } from "../container/dependencies";

new Worker(
    "generation",
    async (job) => {
        console.log("[Generation Worker] Job Received");

        const { jobId } = job.data as {
            jobId: string;
        };

        console.log("Processing Job:", jobId);
        try {
            const processGeneration = await prosessGenerationUseCase.execute(jobId)
        } catch (error) {
            console.error(error);

            await generationJobRepository.updateStatusById(
                jobId,
                "FAILED",
                error instanceof Error ? error.message : "Unknown error"
            );
        }
    },
    {
        connection: redisConnectionConfig,
        concurrency: 5,
    }
);