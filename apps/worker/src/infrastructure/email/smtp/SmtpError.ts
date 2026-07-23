/**
 * SMTP error categories for structured error tracking.
 * Allows the use-case layer to make intelligent decisions
 * (e.g. pause campaign on rate-limit vs. skip email on bounce).
 */
export type SmtpErrorCode =
    | "RATE_LIMIT"        // 421, 450, 452, "too many" style responses
    | "DAILY_LIMIT"       // provider-level daily quota exceeded
    | "AUTH_FAILED"       // 535 – bad credentials
    | "CONNECTION"        // ECONNREFUSED, ETIMEDOUT, ENOTFOUND
    | "REJECTED"          // 550, 551, 553 – permanent recipient rejection
    | "UNKNOWN";          // everything else

export class SmtpError extends Error {
    public readonly code: SmtpErrorCode;
    /** Raw nodemailer / OS error that caused this */
    public override readonly cause: unknown;

    constructor(message: string, code: SmtpErrorCode, cause: unknown) {
        super(message);
        this.name = "SmtpError";
        this.code = code;
        this.cause = cause;
    }
}

/**
 * Inspect a raw error thrown by nodemailer and wrap it in a typed SmtpError.
 */
export function classifySmtpError(err: unknown): SmtpError {
    const raw = err as Record<string, unknown>;

    const responseCode: number = (raw["responseCode"] as number) ?? 0;
    const response: string = ((raw["response"] as string) ?? "").toLowerCase();
    const command: string = ((raw["command"] as string) ?? "").toLowerCase();
    const errno: string = ((raw["code"] as string) ?? "").toUpperCase();
    const message: string = ((raw["message"] as string) ?? "").toLowerCase();

    // ── Connection-level errors ─────────────────────────────────────────────
    if (["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "ECONNRESET", "EHOSTUNREACH"].includes(errno)) {
        return new SmtpError(
            `SMTP connection error [${errno}]: ${raw["message"] ?? ""}`,
            "CONNECTION",
            err
        );
    }

    // ── Auth failures ───────────────────────────────────────────────────────
    if (responseCode === 535 || response.includes("authentication") && response.includes("failed")) {
        return new SmtpError(
            `SMTP authentication failed (535): ${raw["response"] ?? ""}`,
            "AUTH_FAILED",
            err
        );
    }

    // ── Rate / sending limits ───────────────────────────────────────────────
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
            `SMTP rate limit reached (${responseCode}): ${raw["response"] ?? message}`,
            "RATE_LIMIT",
            err
        );
    }

    // ── Daily / quota limits ────────────────────────────────────────────────
    if (
        response.includes("daily") ||
        response.includes("quota") ||
        response.includes("sending limit") ||
        response.includes("limit exceeded") ||
        message.includes("daily") ||
        message.includes("quota exceeded")
    ) {
        return new SmtpError(
            `SMTP daily/quota limit exceeded: ${raw["response"] ?? message}`,
            "DAILY_LIMIT",
            err
        );
    }

    // ── Permanent recipient rejection ───────────────────────────────────────
    if (responseCode === 550 || responseCode === 551 || responseCode === 553) {
        return new SmtpError(
            `SMTP recipient rejected (${responseCode}): ${raw["response"] ?? ""}`,
            "REJECTED",
            err
        );
    }

    // ── Fallback ────────────────────────────────────────────────────────────
    return new SmtpError(
        `SMTP error (code ${responseCode || errno || "unknown"}): ${raw["message"] ?? ""}`,
        "UNKNOWN",
        err
    );
}
