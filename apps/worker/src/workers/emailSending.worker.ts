import { Worker } from "bullmq";
import { queueConnection } from "@repo/queue";
import { sendAuthEmailUseCase } from "../container/authEmail-dependencies";
import type { AuthEmailJobData } from "@repo/types";
import { logger } from "../logger";

const workerLogger = logger.child({
  worker: "email-sending",
});

workerLogger.info("Email sending worker started");

const worker = new Worker(
  "email-sending",
  async (job) => {
    const data = job.data as AuthEmailJobData;
    workerLogger.info({ jobId: job.id, emailType: data.type }, "Processing auth email job");
    try {
      await sendAuthEmailUseCase.execute(data);
    } catch (error) {
      workerLogger.error({ err: error, jobId: job.id }, "Email sending worker error");
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
    "Email sending worker connection error"
  );
});