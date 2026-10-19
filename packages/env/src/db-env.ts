import { createEnv } from "@t3-oss/env-core";
import { databaseSchema } from "./schema";

// Server-only env — used only by the database package.
export const dbEnv = createEnv({
  server: {
    ...databaseSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
