import { Queue } from "bullmq";
import { redisConnectionConfig } from "./connection";

export const quotaResetQueue = new Queue(
  "reset-api-key",
  {
    connection: redisConnectionConfig,
  }
);
