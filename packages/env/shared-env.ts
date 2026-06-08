import { createEnv } from "@t3-oss/env-core";
import z from "zod";

// Shared env — used by all apps (web, http-server, etc.)

export const sharedEnv = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});