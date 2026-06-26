
import { queueEnv } from "@repo/env/queue-env";
import IORedis from "ioredis";

// Plain config object — use this for BullMQ queues/workers (avoids ioredis version conflicts)
export const redisConnectionConfig = {
  host: queueEnv.REDIS_HOST,
  port: Number(queueEnv.REDIS_PORT),
};

// IORedis instance — use this for direct Redis operations (caching, sessions, verification, etc.)
export const redisConnection = new IORedis(redisConnectionConfig);
