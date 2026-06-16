import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
