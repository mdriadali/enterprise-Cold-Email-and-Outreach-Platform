export function extractMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object" || data === null) return null;
  const msg = "message" in data ? data.message : "massage" in data ? data.massage : null;
  return typeof msg === "string" && msg.trim() ? msg.trim() : null;
}
