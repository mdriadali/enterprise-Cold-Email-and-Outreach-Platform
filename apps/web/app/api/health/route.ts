const REQUEST_TIMEOUT_MS = 5_000;

function readyUrl(): string {
  const base = process.env.HTTP_SERVER_URL ?? "http://localhost:4000/api/v1";
  return new URL("/ready", base).toString();
}

/**
 * Container health probe.
 *
 * It reflects http-server readiness (Postgres + Redis + worker heartbeat), so a
 * deployment where the worker is missing is reported as unhealthy instead of
 * silently serving traffic.
 */
export async function GET(): Promise<Response> {
  try {
    const response = await fetch(readyUrl(), {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return Response.json({ status: "not-ready" }, { status: 503 });
    }

    return Response.json({ status: "ready" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
