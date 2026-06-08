import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";



export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    HTTP_PORT: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});