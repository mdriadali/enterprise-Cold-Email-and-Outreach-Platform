import { createEnv } from "@t3-oss/env-core";
import {
  redisSchema,
} from "./schema";

export const  queueEnv = createEnv({
  server: {
    ...redisSchema
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});