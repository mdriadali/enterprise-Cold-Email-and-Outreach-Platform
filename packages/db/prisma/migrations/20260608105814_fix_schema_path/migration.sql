-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('GEMINI', 'OPENAI', 'ANTHROPIC');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Subscription" AS ENUM ('STARTER', 'PROFESSIONAL', 'ULTRA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "subscription" "Subscription" NOT NULL DEFAULT 'STARTER',
    "aiProvider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "apiKey" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
