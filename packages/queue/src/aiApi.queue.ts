import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const resetApiStatusQueue = new Queue(
  "reset-api-key-status",
  {
    connection: queueConnection as any,
  }
);
