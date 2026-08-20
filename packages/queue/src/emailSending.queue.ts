import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const emailSendingQueue = new Queue("email-sending", {
  connection: queueConnection as any,
});
