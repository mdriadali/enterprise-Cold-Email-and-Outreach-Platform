import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { dbEnv } from "@repo/env/db-env";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: dbEnv.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});
export * from "@prisma/client";