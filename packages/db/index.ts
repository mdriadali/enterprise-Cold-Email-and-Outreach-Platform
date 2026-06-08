
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sharedEnv } from "@repo/env/shared-env";
import { Pool } from "pg";


const pool = new Pool({
  connectionString: sharedEnv.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});