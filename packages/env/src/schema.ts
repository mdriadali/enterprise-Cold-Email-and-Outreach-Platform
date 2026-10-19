
import z from "zod";

export const webSchema = {
  APP_NAME: z.string(),
  HTTP_SERVER_URL:z.string().url(),
};
export const databaseSchema = {
  DATABASE_URL: z.string().url(),
  // Pool size is env driven so the total connection budget stays predictable
  // when services are scaled (pool max x replicas < database max_connections).
  DB_POOL_MAX: z.coerce.number().int().positive().optional(),
  DB_STATEMENT_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
};

export const authSchema = {
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
};

export const httpSchema = {
  HTTP_PORT: z.string().optional().default("4000"),
};

export const redisSchema = {
  REDIS_URL:z.string(),
};

export const smtpSchema = {
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.string().optional().default("587"),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default(""),
  APP_URL: z.string().optional().default("http://localhost:3000"),
  // ssl = implicit TLS/SSL (port 465), tls = STARTTLS upgrade (port 587), none = plaintext
  SMTP_ENCRYPTION: z.enum(["ssl", "tls", "none"]).optional().default("none"),
};

export const loggerSchema = {
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  LOG_LEVEL: z.string().optional().default("info"),
};

/**
 * Shared resilience policy for every service.
 *
 * Platform rule: bounded retries, then fail fast. Dependencies are tried at most
 * 3 times, and a service that keeps crashing stays down instead of restarting
 * forever ("onek onek retry" must never happen).
 */
export const resilienceSchema = {
  /** How often runtime health checks run. */
  HEALTH_CHECK_INTERVAL_MS: z.coerce.number().int().positive().optional().default(15_000),
  /** Consecutive failures tolerated before the process gives up. */
  FAILURE_THRESHOLD: z.coerce.number().int().positive().optional().default(3),
  /** Container restarts allowed before the service stays down. */
  CRASH_LOOP_MAX_RESTARTS: z.coerce.number().int().positive().optional().default(3),
  /** Window in which those restarts are counted. */
  CRASH_LOOP_WINDOW_MS: z.coerce.number().int().positive().optional().default(300_000),
  /** Where the crash counter is persisted (container writable layer). */
  CRASH_STATE_DIR: z.string().optional(),
};