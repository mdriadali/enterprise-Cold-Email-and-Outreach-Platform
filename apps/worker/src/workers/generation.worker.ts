import { Worker } from "bullmq";
import { queueConnection } from "@repo/queue";
import { prosessGenerationUseCase } from "../container/processgeneration-usecase-dependencies";
import { generationJobRepository } from "../container/dependencies";
import { logger } from "../logger";

const workerLogger = logger.child({
  worker: "generation",
});

workerLogger.info("Generation worker started");

const worker = new Worker(
  "generation",
  async (job) => {
    const { jobId } = job.data as { jobId: string };
    workerLogger.info({ jobId: job.id, generationJobId: jobId }, "Processing generation job");

    try {
      await prosessGenerationUseCase.execute(jobId);
    } catch (error) {
      workerLogger.error({ err: error, jobId: job.id, generationJobId: jobId }, "Generation worker processing error");

      await generationJobRepository.updateStatusById(
        jobId,
        "FAILED",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  },
  {
    connection: queueConnection as any,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  workerLogger.info({ jobId: job.id }, "Job completed successfully");
});

worker.on("failed", (job, err) => {
  workerLogger.error({ jobId: job?.id, err }, "Job failed");
});

worker.on("error", (error) => {
  workerLogger.error(
    { err: error },
    "Generation worker connection error"
  );
});