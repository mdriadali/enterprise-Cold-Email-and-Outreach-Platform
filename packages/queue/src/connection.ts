import { queueEnv } from "@repo/env/queue-env";
import IORedis from "ioredis";

// General-purpose Redis connection (Caching, OTP verification, rate limiting, etc.)
export const redisConnection = new IORedis(queueEnv.REDIS_URL);

// BullMQ specific connection (BullMQ strictly requires maxRetriesPerRequest: null)
export const queueConnection = new IORedis(queueEnv.REDIS_URL, {
  maxRetriesPerRequest: null,
});