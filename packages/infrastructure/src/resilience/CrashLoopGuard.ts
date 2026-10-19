import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

interface CrashState {
  count: number;
  windowStartedAt: number;
}

export interface CrashLoopOptions {
  /** Container restarts allowed before the service stays down. Defaults to 3. */
  maxRestarts?: number;
  /** Window in which those restarts are counted. Defaults to 5 minutes. */
  windowMs?: number;
  /** Directory used to persist the counter. Defaults to the OS temp dir. */
  stateDir?: string;
}

const DEFAULT_STATE_DIR = "/tmp/outreach-platform";

function stateFilePath(service: string, stateDir: string): string {
  const safeName = service.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return join(stateDir, `${safeName}.crash.json`);
}

function readState(file: string): CrashState | undefined {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Partial<CrashState>;

    if (
      typeof parsed.count === "number" &&
      typeof parsed.windowStartedAt === "number"
    ) {
      return { count: parsed.count, windowStartedAt: parsed.windowStartedAt };
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function writeState(file: string, state: CrashState): void {
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(state), "utf8");
  } catch {
    // Bookkeeping is best-effort: never let it take the process down.
  }
}

/**
 * Records a start attempt and reports whether the service is stuck in a crash
 * loop.
 *
 * A container runtime restarts a crashed process by itself, which would rebuild
 * exactly the "retry forever" behaviour we are removing. This counter counts
 * those restarts across the container's writable layer (it survives a restart,
 * but a fresh deploy resets it). Once the budget is used up the caller must exit
 * with code 0 so the orchestrator keeps the service down until a human
 * intervenes — the project stays off instead of flapping.
 */
export function registerStartAttempt(
  service: string,
  options?: CrashLoopOptions,
): { shouldStayDown: boolean; attempt: number; maxRestarts: number } {
  const maxRestarts = options?.maxRestarts ?? 3;
  const windowMs = options?.windowMs ?? 5 * 60_000;
  const stateDir = options?.stateDir ?? DEFAULT_STATE_DIR;
  const file = stateFilePath(service, stateDir);
  const now = Date.now();
  const previous = readState(file);

  let count = 1;
  let windowStartedAt = now;

  if (previous && now - previous.windowStartedAt < windowMs) {
    count = previous.count + 1;
    windowStartedAt = previous.windowStartedAt;
  }

  writeState(file, { count, windowStartedAt });

  return { shouldStayDown: count > maxRestarts, attempt: count, maxRestarts };
}

/** Clears the crash counter after a successful start. */
export function clearCrashState(service: string, options?: CrashLoopOptions): void {
  const stateDir = options?.stateDir ?? DEFAULT_STATE_DIR;

  try {
    rmSync(stateFilePath(service, stateDir), { force: true });
  } catch {
    // Best-effort cleanup only.
  }
}

/**
 * Resets the crash counter only after the service has stayed up for a full
 * window.
 *
 * Clearing the counter as soon as the process listens would defeat the guard: a
 * service that boots fine but crashes a minute later (a dependency disappears at
 * runtime) would reset its own budget on every restart and loop forever, which is
 * exactly the behaviour we are removing.
 */
export function scheduleStabilityReset(
  service: string,
  options?: CrashLoopOptions,
): void {
  const windowMs = options?.windowMs ?? 5 * 60_000;

  const timer = setTimeout(() => {
    clearCrashState(service, options);
  }, windowMs);

  // Never hold the event loop open just for bookkeeping.
  timer.unref?.();
}
