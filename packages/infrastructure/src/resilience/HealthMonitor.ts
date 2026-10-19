import { fatal } from "@repo/common";
import type { DependencyCheck } from "./DependencyGuard";

export interface HealthMonitorOptions {
  /** How often the checks run, in milliseconds. Defaults to 15000. */
  intervalMs?: number;
  /** Consecutive failures allowed before giving up. Defaults to 3. */
  failureThreshold?: number;
  /**
   * Called when a dependency exceeded the failure threshold. Defaults to
   * {@link fatal}, which terminates the process.
   */
  onFatal?: (reason: string, cause?: unknown) => void;
}

/**
 * Watches critical dependencies while the service is running.
 *
 * Boot already validates them, but a database or cache can die later. Instead of
 * letting the driver reconnect forever, a dependency is allowed a small number
 * of consecutive failures; once the threshold is crossed the platform gives up
 * and the process exits (fail fast, no endless retry).
 */
export class HealthMonitor {
  private timer: ReturnType<typeof setInterval> | undefined;
  private running = false;
  private readonly failures = new Map<string, number>();

  private readonly intervalMs: number;
  private readonly failureThreshold: number;
  private readonly onFatal: (reason: string, cause?: unknown) => void;

  constructor(
    private readonly checks: DependencyCheck[],
    options: HealthMonitorOptions = {},
  ) {
    this.intervalMs = options.intervalMs ?? 15_000;
    this.failureThreshold = options.failureThreshold ?? 3;
    this.onFatal = options.onFatal ?? fatal;
  }

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);

    // Do not keep the event loop alive just for health checks.
    this.timer.unref?.();
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
  }

  async runOnce(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      for (const dependency of this.checks) {
        try {
          await dependency.check();
          this.failures.set(dependency.name, 0);
        } catch (error) {
          const count = (this.failures.get(dependency.name) ?? 0) + 1;
          this.failures.set(dependency.name, count);

          if (count >= this.failureThreshold) {
            this.stop();
            this.onFatal(
              `health check failed ${count}x in a row: ${dependency.name}`,
              error,
            );
            return;
          }
        }
      }
    } finally {
      this.running = false;
    }
  }
}
