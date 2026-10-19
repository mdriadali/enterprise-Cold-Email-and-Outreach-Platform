/**
 * Central retry policy used by every third-party and infrastructure integration.
 *
 * Platform rule: retries are ALWAYS bounded. Nothing is allowed to retry
 * forever, because a single downstream outage would otherwise turn into a
 * self-inflicted request storm that drains provider connection/rate limits.
 * The default budget is 3 attempts total (1 try + 2 retries).
 */

export const DEFAULT_MAX_ATTEMPTS = 3;

/** TCP/OS level failures that are safe to retry. */
const RETRYABLE_NETWORK_CODES: ReadonlySet<string> = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

export interface RetryOptions {
  /** Total attempts including the first one. Defaults to 3. */
  maxAttempts?: number;
  /** Delay before the second attempt, in milliseconds. Defaults to 500. */
  baseDelayMs?: number;
  /** Upper bound for a single delay, in milliseconds. Defaults to 5000. */
  maxDelayMs?: number;
  /** Randomisation ratio (0..1) applied to every delay. Defaults to 0.2. */
  jitter?: number;
  /** Invoked after a failed attempt, before the next one is scheduled. */
  onAttemptFailed?: (error: unknown, attempt: number) => void;
}

function readNumber(source: unknown, key: string): number | undefined {
  if (typeof source !== "object" || source === null) return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "number" ? value : undefined;
}

function readString(source: unknown, key: string): string | undefined {
  if (typeof source !== "object" || source === null) return undefined;
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export class BackoffHelper {
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff with a cap and jitter. `attempt` is 1-based, so the
   * first retry (attempt 1) waits roughly `baseDelayMs`.
   */
  static computeDelay(attempt: number, options?: RetryOptions): number {
    const base = options?.baseDelayMs ?? 500;
    const cap = options?.maxDelayMs ?? 5_000;
    const jitter = options?.jitter ?? 0.2;

    const exponential = Math.min(base * 2 ** Math.max(0, attempt - 1), cap);
    const spread = Math.round(exponential * jitter);
    const random = spread > 0 ? Math.random() * spread : 0;

    return Math.max(0, Math.round(exponential - spread / 2 + random));
  }
}

export class RetryPolicy {
  static readonly DEFAULT_MAX_ATTEMPTS = DEFAULT_MAX_ATTEMPTS;

  /** HTTP status carried by the error, when the failure came from HTTP. */
  static statusOf(error: unknown): number | undefined {
    const direct = readNumber(error, "status");
    if (direct !== undefined) return direct;

    const response = (error as { response?: unknown } | undefined)?.response;
    return readNumber(response, "status");
  }

  /** Driver/OS error code (e.g. ECONNRESET, ENOTFOUND). */
  static codeOf(error: unknown): string | undefined {
    const direct = readString(error, "code");
    if (direct !== undefined) return direct.toUpperCase();

    const cause = (error as { cause?: unknown } | undefined)?.cause;
    const causeCode = readString(cause, "code");
    return causeCode?.toUpperCase();
  }

  /** True when the failure is worth retrying (network / 408 / 429 / 5xx). */
  static isRetryable(error: unknown): boolean {
    if (error === undefined || error === null) return false;

    const status = RetryPolicy.statusOf(error);
    if (status !== undefined) {
      return status === 408 || status === 429 || status >= 500;
    }

    const code = RetryPolicy.codeOf(error);
    if (code !== undefined) {
      return RETRYABLE_NETWORK_CODES.has(code);
    }

    // Unknown shape: do not assume it is safe to hammer the dependency.
    return false;
  }

  /**
   * Runs `operation` with a bounded number of attempts. Retries only happen for
   * retryable failures; everything else is thrown immediately.
   */
  static async run<T>(
    operation: (attempt: number) => Promise<T>,
    options?: RetryOptions,
  ): Promise<T> {
    const maxAttempts = Math.max(1, options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);

    let lastError: unknown = undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        await BackoffHelper.delay(BackoffHelper.computeDelay(attempt - 1, options));
      }

      try {
        return await operation(attempt);
      } catch (error) {
        lastError = error;
        options?.onAttemptFailed?.(error, attempt);

        if (attempt >= maxAttempts || !RetryPolicy.isRetryable(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  }
}
