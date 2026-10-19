import { BackoffHelper, DEFAULT_MAX_ATTEMPTS } from "@repo/common";

/** A single critical dependency that must be reachable before serving traffic. */
export interface DependencyCheck {
  /** Human readable name used in logs (e.g. "postgres", "redis"). */
  name: string;
  /** Resolves when the dependency is reachable, rejects otherwise. */
  check: () => Promise<void>;
}

export class DependencyUnavailableError extends Error {
  public readonly dependency: string;

  constructor(dependency: string, cause?: unknown) {
    super(`Critical dependency unavailable: ${dependency}`);
    this.name = "DependencyUnavailableError";
    this.dependency = dependency;
    this.cause = cause;

    Error.captureStackTrace?.(this, DependencyUnavailableError);
  }
}

/**
 * Verifies critical dependencies at boot with a bounded retry budget.
 *
 * Policy: at most {@link DEFAULT_MAX_ATTEMPTS} attempts. When the budget is
 * exhausted the error is re-thrown so the caller can take the process down.
 * This is deliberately a "fail fast" gate — a deployment whose database or
 * Redis is unreachable must not come up at all.
 */
export class DependencyGuard {
  static async verify(
    checks: DependencyCheck[],
    maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        for (const dependency of checks) {
          try {
            await dependency.check();
          } catch (error) {
            throw new DependencyUnavailableError(dependency.name, error);
          }
        }

        return;
      } catch (error) {
        const name =
          error instanceof DependencyUnavailableError
            ? error.dependency
            : "unknown";

        // eslint-disable-next-line no-console
        console.error(
          `[dependency-guard] attempt ${attempt}/${maxAttempts} failed (${name})`,
          error,
        );

        if (attempt >= maxAttempts) {
          throw error;
        }

        await BackoffHelper.delay(
          BackoffHelper.computeDelay(attempt, {
            baseDelayMs: 1_000,
            maxDelayMs: 4_000,
          }),
        );
      }
    }
  }
}
