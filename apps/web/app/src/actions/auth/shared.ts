export function extractMessage(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  const msg = "message" in record ? record.message : "massage" in record ? record.massage : "massae" in record ? record.massae : null;
  return typeof msg === "string" && msg.trim() ? msg.trim() : null;
}