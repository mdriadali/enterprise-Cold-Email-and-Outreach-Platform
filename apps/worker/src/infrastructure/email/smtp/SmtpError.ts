/**
 * SMTP error categories for structured error tracking.
 * Allows the use-case layer to make intelligent decisions.
 */
export type SmtpErrorCode =
  | "RATE_LIMIT"
  | "DAILY_LIMIT"
  | "AUTH_FAILED"
  | "CONNECTION"
  | "REJECTED"
  | "UNKNOWN";

export class SmtpError extends Error {
  public readonly code: SmtpErrorCode;

  public override readonly cause: unknown;

  constructor(
    message: string,
    code: SmtpErrorCode,
    cause: unknown,
  ) {
    super(message);

    this.name = "SmtpError";
    this.code = code;
    this.cause = cause;

    Error.captureStackTrace?.(this, SmtpError);
  }
}

/**
 * Inspect a raw Nodemailer / OS error and classify it.
 */
export function classifySmtpError(err: unknown): SmtpError {
  const raw =
    err instanceof Error
      ? (err as Error & Record<string, unknown>)
      : (err as Record<string, unknown>);

  const responseCode =
    typeof raw?.responseCode === "number"
      ? raw.responseCode
      : 0;

  const response =
    typeof raw?.response === "string"
      ? raw.response.toLowerCase()
      : "";

  const errno =
    typeof raw?.code === "string"
      ? raw.code.toUpperCase()
      : "";

  const message =
    typeof raw?.message === "string"
      ? raw.message.toLowerCase()
      : "";

  // ── Connection-level errors ───────────────────────────────

  if (
    [
      "ECONNREFUSED",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNRESET",
      "EHOSTUNREACH",
    ].includes(errno)
  ) {
    return new SmtpError(
      `SMTP connection error [${errno}]: ${raw?.message ?? ""}`,
      "CONNECTION",
      err,
    );
  }

  // ── Authentication failures ───────────────────────────────

  if (
    responseCode === 535 ||
    (response.includes("authentication") &&
      response.includes("failed"))
  ) {
    return new SmtpError(
      `SMTP authentication failed: ${raw?.response ?? raw?.message ?? ""}`,
      "AUTH_FAILED",
      err,
    );
  }

  // ── Daily / quota limits ──────────────────────────────────
  // Check this before RATE_LIMIT because some providers may
  // include both "limit" and "daily/quota".

  if (
    response.includes("daily") ||
    response.includes("quota") ||
    response.includes("sending limit") ||
    response.includes("limit exceeded") ||
    message.includes("daily") ||
    message.includes("quota exceeded")
  ) {
    return new SmtpError(
      `SMTP daily/quota limit exceeded: ${
        raw?.response ?? raw?.message ?? ""
      }`,
      "DAILY_LIMIT",
      err,
    );
  }

  // ── Rate / temporary sending limits ───────────────────────

  if (
    responseCode === 421 ||
    responseCode === 450 ||
    responseCode === 452 ||
    response.includes("rate limit") ||
    response.includes("too many") ||
    response.includes("slow down") ||
    response.includes("temporarily") ||
    message.includes("rate limit") ||
    message.includes("too many")
  ) {
    return new SmtpError(
      `SMTP rate limit reached (${responseCode || "unknown"}): ${
        raw?.response ?? raw?.message ?? ""
      }`,
      "RATE_LIMIT",
      err,
    );
  }

  // ── Permanent recipient rejection ─────────────────────────

  if (
    responseCode === 550 ||
    responseCode === 551 ||
    responseCode === 553
  ) {
    return new SmtpError(
      `SMTP recipient rejected (${responseCode}): ${
        raw?.response ?? raw?.message ?? ""
      }`,
      "REJECTED",
      err,
    );
  }

  // ── Fallback ──────────────────────────────────────────────

  return new SmtpError(
    `SMTP error (code ${
      responseCode || errno || "unknown"
    }): ${raw?.message ?? ""}`,
    "UNKNOWN",
    err,
  );
}