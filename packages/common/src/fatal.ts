/**
 * Single place that decides what happens when the platform gives up.
 *
 * Policy: when a critical dependency (Postgres/Redis) or the worker cannot be
 * brought up within its bounded retry budget, the whole process must stop. We
 * fail fast instead of retrying forever, so a partial "half working" deployment
 * never stays up.
 *
 * The default handler terminates the process. Applications can register their
 * own handler first (e.g. to flush logs / close connections) and then still call
 * the default behaviour.
 */

export type FatalHandler = (reason: string, cause?: unknown) => void;

let handler: FatalHandler = (reason: string, cause?: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[fatal] ${reason}`, cause ?? "");
  process.exit(1);
};

/** Overrides the fatal handler. Returns the previous handler. */
export function setFatalHandler(next: FatalHandler): FatalHandler {
  const previous = handler;
  handler = next;
  return previous;
}

/** Takes the process down with the given reason. */
export function fatal(reason: string, cause?: unknown): void {
  handler(reason, cause);
}
