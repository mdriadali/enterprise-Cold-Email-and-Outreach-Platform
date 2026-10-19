import { redisConnection } from "./connection";

const DEFAULT_INTERVAL_MS = 10_000;
const DEFAULT_TTL_SECONDS = 30;

export interface Heartbeat {
  stop(): void;
}

function heartbeatKey(service: string): string {
  return `service:${service}:heartbeat`;
}

/**
 * Publishes a short-lived liveness key for a service.
 *
 * The key expires on its own, so a crashed service stops looking alive without
 * any cleanup. http-server readiness checks this for the worker, which is how the
 * platform enforces "if the worker is not up, the whole project is down".
 */
export function startHeartbeat(
  service: string,
  options?: { intervalMs?: number; ttlSeconds?: number },
): Heartbeat {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const ttlSeconds = options?.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const key = heartbeatKey(service);

  const beat = async (): Promise<void> => {
    try {
      await redisConnection.set(key, Date.now().toString(), "EX", ttlSeconds);
    } catch (error) {
      // A single missed beat is not fatal on its own. The health monitor is what
      // decides when the dependency has actually failed.
      console.error(`[heartbeat:${service}] failed to publish`, error);
    }
  };

  void beat();

  const timer = setInterval(() => {
    void beat();
  }, intervalMs);

  timer.unref?.();

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

/** True when the service published a heartbeat within its TTL window. */
export async function isServiceAlive(service: string): Promise<boolean> {
  const value = await redisConnection.get(heartbeatKey(service));
  return value !== null;
}

/** Removes the heartbeat immediately (used during graceful shutdown). */
export async function stopHeartbeat(service: string): Promise<void> {
  await redisConnection.del(heartbeatKey(service));
}
