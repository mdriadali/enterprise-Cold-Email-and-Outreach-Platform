import express, { type NextFunction, type Request, type Response, } from "express";
import routes from "./presentation/routes";
import cookieParser from "cookie-parser";
import { serverEnv } from "@repo/env/server-env";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import { fatal } from "@repo/common";
import { checkDatabase, closeDatabase } from "@repo/db";
import { closeRedisConnections, isServiceAlive, pingRedis } from "@repo/queue";
import {
  DependencyGuard,
  HealthMonitor,
  installShutdownHooks,
  registerShutdown,
  registerStartAttempt,
  scheduleStabilityReset,
} from "@repo/infrastructure/resilience";
import { logger } from "./logger";

const app = express();

const server = createServer(app);
const io = new Server(server);

// registerSocket(io);

const port = serverEnv.HTTP_PORT;

/**
 * Bounded policy, identical to the worker and the web app: three consecutive
 * health-check failures and three restart attempts, then the service stays down
 * instead of retrying forever.
 */
const healthCheckIntervalMs = serverEnv.HEALTH_CHECK_INTERVAL_MS;
const failureThreshold = serverEnv.FAILURE_THRESHOLD;

const crashLoopOptions = {
  maxRestarts: serverEnv.CRASH_LOOP_MAX_RESTARTS,
  windowMs: serverEnv.CRASH_LOOP_WINDOW_MS,
  stateDir: serverEnv.CRASH_STATE_DIR,
};

// In development a crash loop is annoying rather than dangerous, so the restart
// budget is only enforced where an orchestrator would actually restart us.
const isProduction = process.env.NODE_ENV === "production";

async function checkWorker(): Promise<void> {
  const alive = await isServiceAlive("worker");

  if (!alive) {
    throw new Error("worker heartbeat missing");
  }
}

// Global Middlewares

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request + Response Logger


app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  //Request coming
  logger.info(
    {
      method: req.method,
      url: req.originalUrl,
    },
    "Incoming request",
  );

  // Response 
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      "Request completed",
    );
  });

  next();
});

// Liveness — the process is up. Used by container orchestration.


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness — the process can actually serve traffic: Postgres and Redis are
// reachable and the worker is alive. A missing worker heartbeat means the
// deployment is incomplete, so readiness fails.

app.get("/ready", async (_req, res) => {
  try {
    await checkDatabase();
    await pingRedis();
    await checkWorker();

    res.status(200).json({ status: "ready" });
  } catch (error) {
    logger.warn({ err: error }, "Readiness check failed");
    res.status(503).json({ status: "not-ready" });
  }
});


// Register Routes

app.use("/api/v1", routes);


// Global Error Handler

app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    logger.error(
      {
        method: req.method,
        url: req.originalUrl,
        err,
      },
      "Request failed",
    );

    res.status(500).json({
      message: "Internal Server Error",
    });
  },
);


// Bootstrap

async function bootstrap(): Promise<void> {
  installShutdownHooks("http-server");

  const startup = isProduction
    ? registerStartAttempt("http-server", crashLoopOptions)
    : { shouldStayDown: false, attempt: 1, maxRestarts: crashLoopOptions.maxRestarts };

  if (startup.shouldStayDown) {
    logger.error(
      { attempt: startup.attempt, maxRestarts: startup.maxRestarts },
      "Crash loop detected, staying down instead of restarting forever",
    );

    // Exit 0 so the orchestrator does NOT restart this container again.
    process.exit(0);
  }

  // Boot gate: at most 3 attempts, then fail fast so a broken deployment never
  // comes up. The worker is intentionally NOT part of the boot gate (it starts
  // in parallel); it is enforced through readiness and the runtime health
  // monitor below.
  await DependencyGuard.verify([
    { name: "postgres", check: checkDatabase },
    { name: "redis", check: pingRedis },
  ]);

  const healthMonitor = new HealthMonitor(
    [
      { name: "postgres", check: checkDatabase },
      { name: "redis", check: pingRedis },
      // If the worker disappears the platform is considered down and this
      // process stops as well, so the project does not keep serving half-broken.
      { name: "worker", check: checkWorker },
    ],
    {
      intervalMs: healthCheckIntervalMs,
      failureThreshold,
    },
  );

  healthMonitor.start();

  registerShutdown(async () => {
    healthMonitor.stop();

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    io.close();
    await closeRedisConnections();
    await closeDatabase();
  });

  server.listen(port, () => {
    // The crash-loop budget is only reset once this process has stayed up for a
    // full window — see scheduleStabilityReset.
    if (isProduction) {
      scheduleStabilityReset("http-server", crashLoopOptions);
    }

    logger.info(
      {
        port,
      },
      "Server started",
    );
  });
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "HTTP server failed to start");
  fatal("http-server bootstrap failed", error);
});
