import { queueConnection } from "@repo/queue";
import { Worker } from "bullmq";
import { mailSendUseCase } from "../container/mailSendUsecase-dependencies";
import { logger } from "../logger";

const workerLogger = logger.child({
  worker: "mailsend",
});

workerLogger.info("Mailsend worker started");

const worker = new Worker(
  "campaign-mail-send",
  async (job) => {
    const { campaignId, minDelay, maxDelay } = job.data;
    workerLogger.info({ jobId: job.id, campaignId }, "Processing campaign mail send job");
    try {
      await mailSendUseCase.execute(campaignId, minDelay, maxDelay);
    } catch (error) {
      workerLogger.error({ err: error, jobId: job.id, campaignId }, "Campaign mail send worker error");
      throw error;
    }
  },
  {
    connection: queueConnection as any,
    concurrency: 10,
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
    "Mailsend worker connection error"
  );
});