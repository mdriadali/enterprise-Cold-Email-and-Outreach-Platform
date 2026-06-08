import { createEnv } from "@t3-oss/env-core";
import z from "zod";

// Server-only env — used only by http-server
export const serverEnv = createEnv({
  server: {
    HTTP_PORT: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});