
import z from "zod";

export const webSchema = {
  APP_NAME: z.string(),
  HTTP_SERVER_URL:z.string().url()
};
export const databaseSchema = {
  DATABASE_URL: z.string().url(),
};

export const authSchema = {
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
};

export const httpSchema = {
  HTTP_PORT: z.string().optional().default("4000"),
};

export const redisSchema = {
  REDIS_URL:z.string(),
};

export const smtpSchema = {
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.string().optional().default("587"),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().optional().default(""),
  APP_URL: z.string().optional().default("http://localhost:3000"),
  // ssl = implicit TLS/SSL (port 465), tls = STARTTLS upgrade (port 587), none = plaintext
  SMTP_ENCRYPTION: z.enum(["ssl", "tls", "none"]).optional().default("none"),
};