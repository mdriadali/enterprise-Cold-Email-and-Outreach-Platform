import { createEnv } from "@t3-oss/env-core";
import {
  databaseSchema,
  redisSchema,
  smtpSchema,
} from "./schema";

export const workerEnv = createEnv({
  server: {
    ...databaseSchema,
    ...redisSchema,
    ...smtpSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});