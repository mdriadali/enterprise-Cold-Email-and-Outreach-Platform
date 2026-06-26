import { createEnv } from "@t3-oss/env-core";
import {
  authSchema,
} from "./schema";

export const authEnv = createEnv({
  server: {
    ...authSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});