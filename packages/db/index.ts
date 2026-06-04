import { env } from "@repo/env";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({
  adapter,
});