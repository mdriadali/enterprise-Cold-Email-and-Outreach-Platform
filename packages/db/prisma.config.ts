import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

const migrationDatabaseUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon pooled connections are appropriate for application traffic, while
    // Prisma CLI migrations require a direct connection for session continuity.
    url: migrationDatabaseUrl,
  },
});
