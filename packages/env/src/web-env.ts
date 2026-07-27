import { createEnv } from "@t3-oss/env-core";
import {
  webSchema,
} from "./schema";

export const webEnv = createEnv({
  server: {
    ...webSchema
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});