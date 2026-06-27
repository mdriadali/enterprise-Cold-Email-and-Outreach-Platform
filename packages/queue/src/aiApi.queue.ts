import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const quotaResetQueue = new Queue(
  "reset-api-key",
  {
    connection: queueConnection as any,
  }
);
