import { loggerEnv } from "@repo/env/logger-env";
import { Axiom } from "@axiomhq/js";
import pino from "pino";
import build from "pino-abstract-transport";
import pinoPretty from "pino-pretty";

function createAxiomStream(dataset: string, token: string) {
  const axiom = new Axiom({ token, axiomClient: "outreach-platform" });

  return build(
    async (source) => {
      for await (const log of source) {
        const { time, level, ...event } = log;

        axiom.ingest(dataset, {
          _time: time,
          level: toAxiomLogLevel(level),
          ...event,
        });
      }
    },
    {
      async close() {
        await axiom.flush();
      },
    }
  );
}

function toAxiomLogLevel(level: unknown): string {
  if (typeof level === "string") return level;
  if (typeof level !== "number") return "info";
  if (level <= 10) return "trace";
  if (level <= 20) return "debug";
  if (level <= 30) return "info";
  if (level <= 40) return "warn";
  if (level <= 50) return "error";
  if (level <= 60) return "fatal";

  return "silent";
}

export function createLogger(service: string) {
  const isProduction = loggerEnv.NODE_ENV === "production";

  const streams: (pino.DestinationStream | pino.StreamEntry)[] = [];

  // Development Environment: Pretty Print Logs
  if (!isProduction) {
    streams.push({
      stream: pinoPretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      }),
      level: "debug",
    });
  }

  // Bundling Pino transport targets prevents Pino from resolving them at runtime.
  // Use the same abstract transport interface directly so the Axiom client is
  // statically included in the Bun bundle.
  if (
    isProduction &&
    loggerEnv.AXIOM_TOKEN &&
    loggerEnv.AXIOM_DATASET
  ) {
    streams.push({
      stream: createAxiomStream(
        loggerEnv.AXIOM_DATASET,
        loggerEnv.AXIOM_TOKEN
      ),
      level: (loggerEnv.LOG_LEVEL || "info") as pino.Level,
    });
  }

  // Console Backup Stream
  if (streams.length === 0 || isProduction) {
    streams.push({
      stream: process.stdout,
      level: (loggerEnv.LOG_LEVEL || "info") as pino.Level,
    });
  }

  const destination = pino.multistream(streams);

  return pino(
    {
      level: loggerEnv.LOG_LEVEL || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service,
        environment: isProduction ? "production" : "development",
      },
      redact: {
        paths: [
          "password",
          "token",
          "accessToken",
          "refreshToken",
          "authorization",
          "req.headers.authorization",
        ],
        censor: "[REDACTED]",
      },
    },
    destination
  );
}
