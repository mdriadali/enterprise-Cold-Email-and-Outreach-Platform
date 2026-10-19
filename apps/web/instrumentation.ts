/**
 * Web bootstrap gate.
 *
 * The web app is useless without http-server, and http-server readiness already
 * requires Postgres, Redis and a live worker. So the web app verifies platform
 * readiness at boot (bounded to 3 attempts — the same policy as every other
 * service) and keeps watching it afterwards: if the platform goes down, the web
 * process stops too instead of serving a half-broken app.
 *
 * Plain `fetch` is used on purpose. The web bundle must not pull in the backend
 * infrastructure packages.
 */

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 5_000;

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

const HEALTH_CHECK_INTERVAL_MS = readPositiveInt(
  process.env.HEALTH_CHECK_INTERVAL_MS,
  15_000,
);
const FAILURE_THRESHOLD = readPositiveInt(process.env.FAILURE_THRESHOLD, 3);

function readyUrl(): string {
  const base = process.env.HTTP_SERVER_URL ?? "http://localhost:4000/api/v1";
  return new URL("/ready", base).toString();
}

async function checkPlatform(): Promise<void> {
  const response = await fetch(readyUrl(), {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`platform not ready (status ${response.status})`);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyAtBoot(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await checkPlatform();
      return;
    } catch (error) {
      console.error(
        `[bootstrap] platform readiness attempt ${attempt}/${MAX_ATTEMPTS} failed`,
        error,
      );

      if (attempt >= MAX_ATTEMPTS) {
        throw error;
      }

      await delay(Math.min(1_000 * 2 ** (attempt - 1), 4_000));
    }
  }
}

function watchPlatform(): void {
  let consecutiveFailures = 0;

  // The Next.js server keeps the event loop alive, so the interval is not
  // unref'd — the platform state must keep being observed for the whole life of
  // the process.
  setInterval(() => {
    void (async () => {
      try {
        await checkPlatform();
        consecutiveFailures = 0;
      } catch (error) {
        consecutiveFailures += 1;

        console.error(
          `[bootstrap] platform health check failed ${consecutiveFailures}/${FAILURE_THRESHOLD}`,
          error,
        );

        if (consecutiveFailures >= FAILURE_THRESHOLD) {
          console.error("[bootstrap] platform is down, stopping the web process");
          // Exit non-zero: the orchestrator may restart us once, but the boot
          // gate below will fail again and the process then exits cleanly, so the
          // loop is bounded and the project stays off.
          process.exit(1);
        }
      }
    })();
  }, HEALTH_CHECK_INTERVAL_MS);
}

export async function register(): Promise<void> {
  // Only the Node.js server runtime talks to http-server.
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  // `next build` also executes instrumentation, and no platform exists while the
  // image is being compiled.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[bootstrap] skipping platform gate outside production");
    return;
  }

  try {
    await verifyAtBoot();
  } catch (error) {
    console.error(
      "[bootstrap] web could not reach a ready platform, exiting",
      error,
    );
    // Exit 0: this is a configuration/orchestration problem, not a transient
    // crash. Docker will not restart us, so the deployment fails loudly instead
    // of flapping forever.
    process.exit(0);
  }

  watchPlatform();

  console.log("[bootstrap] platform checks passed, starting web");
}
