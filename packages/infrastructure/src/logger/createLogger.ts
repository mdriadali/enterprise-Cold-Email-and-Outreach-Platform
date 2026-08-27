import { loggerEnv } from "@repo/env/logger-env";
import pino from "pino";
import pinoPretty from "pino-pretty";
import build from "pino-abstract-transport";
import { Logtail } from "@logtail/node";

function createBetterStackStream(sourceToken: string, ingestingHost: string) {
  const logtail = new Logtail(sourceToken, {
    endpoint: `https://${ingestingHost}`,
  });

  return build(
    async function (source) {
      for await (const obj of source) {
        if (!obj) continue;
        const { time, msg, message, level, v, ...meta } = obj;

        let dt: Date | undefined;
        if (time) {
          const parsed = new Date(time);
          if (!isNaN(parsed.valueOf())) dt = parsed;
        }

        const logMsg = msg || message || "";

        let levelName = "info";
        if (typeof level === "number") {
          if (level <= 10) levelName = "trace";
          else if (level <= 20) levelName = "debug";
          else if (level <= 30) levelName = "info";
          else if (level <= 40) levelName = "warn";
          else if (level <= 50) levelName = "error";
          else if (level >= 60) levelName = "fatal";
        } else if (typeof level === "string") {
          levelName = level;
        }

        logtail.log(logMsg, levelName, { ...meta, dt });
      }
    },
    {
      async close() {
        await logtail.flush();
      },
    }
  );
}

export function createLogger(service: string) {
  console.log("RAW NODE_ENV:", process.env.NODE_ENV);
  console.log("LOGGER NODE_ENV:", loggerEnv.NODE_ENV);
  const isProduction = loggerEnv.NODE_ENV === "production";

  const streams: (pino.DestinationStream | pino.StreamEntry)[] = [];

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

  if (
    isProduction &&
    loggerEnv.BETTER_STACK_SOURCE_TOKEN &&
    loggerEnv.BETTER_STACK_INGESTING_HOST
  ) {
    streams.push({
      stream: createBetterStackStream(
        loggerEnv.BETTER_STACK_SOURCE_TOKEN,
        loggerEnv.BETTER_STACK_INGESTING_HOST
      ),
      level: "info",
    });
  }

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
    destination,
  );
}