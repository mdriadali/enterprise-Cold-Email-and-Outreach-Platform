import type { ErrorResponse } from "@repo/types";

export function isErrorResponse(data: unknown): data is ErrorResponse {
    return (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as any).error?.code === "number" &&
        typeof (data as any).error?.message === "string"
    );
}