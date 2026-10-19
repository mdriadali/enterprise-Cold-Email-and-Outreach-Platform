export type ShutdownHandler = () => Promise<void> | void;

const handlers: ShutdownHandler[] = [];
let installed = false;

/** Registers a cleanup step executed on SIGTERM/SIGINT, in reverse order. */
export function registerShutdown(handler: ShutdownHandler): void {
  handlers.push(handler);
}

/**
 * Installs SIGTERM/SIGINT hooks that drain connections and close workers before
 * the process exits, so a deploy never kills in-flight requests or jobs.
 */
export function installShutdownHooks(service: string, timeoutMs = 15_000): void {
  if (installed) return;
  installed = true;

  const run = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[shutdown] ${service} received ${signal}, draining...`);

    const forceExit = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error(`[shutdown] ${service} did not drain in ${timeoutMs}ms, forcing exit`);
      process.exit(1);
    }, timeoutMs);

    forceExit.unref?.();

    try {
      for (const handler of [...handlers].reverse()) {
        await handler();
      }

      clearTimeout(forceExit);
      // eslint-disable-next-line no-console
      console.log(`[shutdown] ${service} drained cleanly`);
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExit);
      // eslint-disable-next-line no-console
      console.error(`[shutdown] ${service} drain failed`, error);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void run("SIGTERM"));
  process.on("SIGINT", () => void run("SIGINT"));
}
