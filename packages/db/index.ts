import { env } from "@repo/env";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
});

export const prismaClient = new PrismaClient({
  adapter,
});