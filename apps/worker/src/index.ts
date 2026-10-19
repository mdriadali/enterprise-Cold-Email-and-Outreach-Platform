import { fatal } from "@repo/common";
import { checkDatabase, closeDatabase } from "@repo/db";
import { workerEnv } from "@repo/env/worker-env";
import { logger } from "./logger";
import {
  DependencyGuard,
  HealthMonitor,
  installShutdownHooks,
  registerShutdown,
  registerStartAttempt,
  scheduleStabilityReset,
} from "@repo/infrastructure/resilience";
import {
  closeRedisConnections,
  pingRedis,
  startHeartbeat,
  stopHeartbeat,
} from "@repo/queue";
import { closeAllSmtpTransporters } from "./infrastructure/email/smtp/SmtpTransporter";
import { closePlatformTransporter } from "./infrastructure/email/smtp/PlatformMailSender";

const bootLogger = logger.child({ component: "bootstrap" });

/**
 * Bounded policy, identical to http-server and the web app: three consecutive
 * health-check failures and three restart attempts, then the service stays down
 * instead of retrying forever.
 */
const healthCheckIntervalMs = workerEnv.HEALTH_CHECK_INTERVAL_MS;
const failureThreshold = workerEnv.FAILURE_THRESHOLD;

const crashLoopOptions = {
  maxRestarts: workerEnv.CRASH_LOOP_MAX_RESTARTS,
  windowMs: workerEnv.CRASH_LOOP_WINDOW_MS,
  stateDir: workerEnv.CRASH_STATE_DIR,
};

// In development a crash loop is annoying rather than dangerous, so the restart
// budget is only enforced where an orchestrator would actually restart us.
const isProduction = process.env.NODE_ENV === "production";

function criticalDependencies() {
  return [
    { name: "postgres", check: checkDatabase },
    { name: "redis", check: pingRedis },
  ];
}

async function bootstrap(): Promise<void> {
  installShutdownHooks("worker");

  const startup = isProduction
    ? registerStartAttempt("worker", crashLoopOptions)
    : { shouldStayDown: false, attempt: 1, maxRestarts: crashLoopOptions.maxRestarts };

  if (startup.shouldStayDown) {
    bootLogger.error(
      { attempt: startup.attempt, maxRestarts: startup.maxRestarts },
      "Crash loop detected, staying down instead of restarting forever",
    );

    // Exit 0 so the orchestrator does NOT restart this container again. Because
    // http-server readiness requires this worker's heartbeat, the whole project
    // ends up off rather than running half-broken.
    process.exit(0);
  }

  // Boot gate: the worker must not consume jobs while Postgres or Redis is
  // unreachable. Three attempts, then the process exits (fail fast).
  await DependencyGuard.verify(criticalDependencies());

  const healthMonitor = new HealthMonitor(criticalDependencies(), {
    intervalMs: healthCheckIntervalMs,
    failureThreshold,
  });
  healthMonitor.start();

  // The heartbeat lets http-server (and therefore the whole deployment) know the
  // worker is alive. If it disappears, readiness fails and the project is down.
  const heartbeat = startHeartbeat("worker");

  // Workers and queues open Redis/SMTP connections on import, so they are only
  // loaded after the dependencies passed the boot gate.
  const generationWorkerModule = await import("./workers/generation.worker");
  const resetWorkerModule = await import("./workers/resetApiKeyStatus.worker");
  const mailWorkerModule = await import("./workers/mailsend.worker");
  const emailWorkerModule = await import("./workers/emailSending.worker");
  const schedulerModule = await import(
    "./container/cronCampaignMailScheduler-dependencies"
  );

  const workers = [
    generationWorkerModule.worker,
    resetWorkerModule.worker,
    mailWorkerModule.worker,
    emailWorkerModule.worker,
  ];

  schedulerModule.cronCampaignMailScheduler.start();

  registerShutdown(async () => {
    healthMonitor.stop();
    heartbeat.stop();

    await Promise.allSettled(workers.map((worker) => worker.close()));

    closeAllSmtpTransporters();
    closePlatformTransporter();

    await stopHeartbeat("worker");
    await closeRedisConnections();
    await closeDatabase();
  });

  // The crash-loop budget is only reset once this process has stayed up for a
  // full window — see scheduleStabilityReset.
  if (isProduction) {
    scheduleStabilityReset("worker", crashLoopOptions);
  }

  bootLogger.info("Worker application started");
}

bootstrap().catch((error) => {
  bootLogger.error({ err: error }, "Worker failed to start");
  fatal("worker bootstrap failed", error);
});

export { logger };
