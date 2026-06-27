
import z from "zod";

export const databaseSchema = {
  DATABASE_URL: z.string().url(),
};

export const authSchema = {
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
};

export const httpSchema = {
  HTTP_PORT: z.string(),
};

export const redisSchema = {
  REDIS_URL:z.string(),
};