import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { sharedEnv } from "@repo/env/shared-env";
import { Pool } from "pg";


const pool = new Pool({
  connectionString: sharedEnv.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});
export * from "@prisma/client";