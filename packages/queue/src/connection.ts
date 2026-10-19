import { queueEnv } from "@repo/env/queue-env";
import IORedis from "ioredis";

/**
 * Consecutive reconnect attempts allowed by the low-level Redis client.
 *
 * Platform policy is "max 3 tries, then give up". `retryStrategy` is invoked
 * once per failed attempt and ioredis resets the counter on a successful
 * connect, so `times` is the number of *consecutive* failures. Returning `null`
 * tells ioredis to stop retrying forever. Each app runs a HealthMonitor which
 * then takes the process down, so the deployment fails fast instead of staying
 * up in a broken half-working state.
 */
const MAX_RECONNECT_ATTEMPTS = 3;

function createReconnectStrategy(client: string) {
  return (times: number): number | null => {
    if (times >= MAX_RECONNECT_ATTEMPTS) {
      console.error(
        `[redis:${client}] giving up after ${MAX_RECONNECT_ATTEMPTS} reconnect attempts`,
      );
      return null;
    }

    return Math.min(times * 500, 5_000);
  };
}

function reportConnectionError(client: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[redis:${client}] connection error: ${message}`);
}

// General-purpose Redis connection (Caching, OTP verification, rate limiting, etc.)
export const redisConnection = new IORedis(queueEnv.REDIS_URL, {
  connectTimeout: 5_000,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  commandTimeout: 5_000,
  retryStrategy: createReconnectStrategy("cache"),
});

redisConnection.on("error", (error) => reportConnectionError("cache", error));

// BullMQ specific connection (BullMQ strictly requires maxRetriesPerRequest: null)
// `commandTimeout` is intentionally NOT set here: BullMQ relies on long blocking
// commands which a command timeout would abort.
export const queueConnection = new IORedis(queueEnv.REDIS_URL, {
  connectTimeout: 5_000,
  maxRetriesPerRequest: null,
  retryStrategy: createReconnectStrategy("queue"),
});

queueConnection.on("error", (error) => reportConnectionError("queue", error));

/** Verifies the cache connection is usable. Used by the boot dependency guard. */
export async function pingRedis(): Promise<void> {
  const response = await redisConnection.ping();

  if (response !== "PONG") {
    throw new Error(`Unexpected Redis PING response: ${response}`);
  }
}

/** Closes the shared Redis connections during graceful shutdown. */
export async function closeRedisConnections(): Promise<void> {
  await Promise.allSettled([redisConnection.quit(), queueConnection.quit()]);
}
