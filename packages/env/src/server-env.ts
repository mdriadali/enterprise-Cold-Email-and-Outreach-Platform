import { createEnv } from "@t3-oss/env-core";
import {
  databaseSchema,
  authSchema,
  httpSchema,
  smtpSchema,
} from "./schema";

export const serverEnv = createEnv({
  server: {
    ...databaseSchema,
    ...authSchema,
    ...httpSchema,
    ...smtpSchema,
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});