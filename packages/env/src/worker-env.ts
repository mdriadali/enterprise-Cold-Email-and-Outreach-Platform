import { createEnv } from "@t3-oss/env-core";
import {
  databaseSchema,
  redisSchema,
  smtpSchema,
  resilienceSchema,
} from "./schema";

export const workerEnv = createEnv({
  server: {
    ...databaseSchema,
    ...redisSchema,
    ...smtpSchema,
    ...resilienceSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});