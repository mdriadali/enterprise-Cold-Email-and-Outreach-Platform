import path from "path";
import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";


dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = createEnv({

  server: {
    DATABASE_URL: z.string().url(),
    TESTENV: z.string(),
    // NEXT_NEW_ENV: z.string(), 
  },
  
  runtimeEnv: process.env, 
});