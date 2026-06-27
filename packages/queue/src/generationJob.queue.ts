import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const generationQueue = new Queue("generation", {
  connection: queueConnection as any,
});


// export const emailSendingQueue = new Queue("email-sending", {
//   connection: redisConnection as any,
// });