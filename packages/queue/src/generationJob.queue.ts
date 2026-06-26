import { Queue } from "bullmq";
import { redisConnectionConfig } from "./connection";

export const generationQueue = new Queue("generation", {
  connection: redisConnectionConfig,
});


// export const emailSendingQueue = new Queue("email-sending", {
//   connection: redisConnectionConfig,
// });