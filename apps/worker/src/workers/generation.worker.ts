import { Worker } from "bullmq";
import { queueConnection } from "@repo/queue";
import { prosessGenerationUseCase } from "../container/processgeneration-usecase-dependencies";
import { generationJobRepository } from "../container/dependencies";
console.log("Generation Worker Start");
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
        connection: queueConnection as any,
        concurrency: 5,
    }
);