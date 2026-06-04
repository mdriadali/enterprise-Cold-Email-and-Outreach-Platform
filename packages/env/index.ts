import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";



export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    HTTP_PORT: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});