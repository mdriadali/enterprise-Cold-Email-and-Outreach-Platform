import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { dbEnv } from "@repo/env/db-env";
import { Pool } from "pg";

const poolMax = dbEnv.DB_POOL_MAX ?? 10;
const statementTimeoutMs = dbEnv.DB_STATEMENT_TIMEOUT_MS ?? 15_000;

const pool = new Pool({
  connectionString: dbEnv.DATABASE_URL,
  max: poolMax,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  // Fail fast instead of holding a worker/request slot on a hanging query.
  statement_timeout: statementTimeoutMs,
  query_timeout: statementTimeoutMs,
  application_name: "outreach-platform",
});

pool.on("error", (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[postgres:pool] idle client error: ${message}`);
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});

/** Lightweight liveness probe used by the boot guard and the health monitor. */
export async function checkDatabase(): Promise<void> {
  await prismaClient.$queryRaw`SELECT 1`;
}

/** Closes the database pool during graceful shutdown. */
export async function closeDatabase(): Promise<void> {
  await prismaClient.$disconnect();
  await pool.end();
}

export * from "@prisma/client";
