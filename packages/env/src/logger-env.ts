import { createEnv } from "@t3-oss/env-core";
import {
  loggerSchema,
} from "./schema";

export const loggerEnv = createEnv({
  server: {
    ...loggerSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});