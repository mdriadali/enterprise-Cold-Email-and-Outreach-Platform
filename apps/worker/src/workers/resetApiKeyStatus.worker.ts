import { Worker } from "bullmq";
import { aiApiRepository } from "../container/dependencies";
import { queueConnection } from "@repo/queue";
import { logger } from "../logger";

const workerLogger = logger.child({
  worker: "reset-api-key-status",
});

workerLogger.info("Reset Api Key Status worker started");

const worker = new Worker(
  "reset-api-key-status",
  async (job) => {
    const { apiKeyId } = job.data as { apiKeyId: string };
    workerLogger.info({ jobId: job.id, apiKeyId }, "Processing API key status reset job");

    try {
      const resetApiUsage = await aiApiRepository.updateStatus(apiKeyId, "AVAILABLE");
      if (!resetApiUsage) {
        workerLogger.warn({ apiKeyId }, "API key not found during reset");
      } else {
        workerLogger.info({ apiKeyId: resetApiUsage.id }, "Successfully reset API key status");
      }
    } catch (error) {
      workerLogger.error({ err: error, jobId: job.id, apiKeyId }, "Quota reset worker error");
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
    "Reset Api Key Status worker connection error"
  );
});