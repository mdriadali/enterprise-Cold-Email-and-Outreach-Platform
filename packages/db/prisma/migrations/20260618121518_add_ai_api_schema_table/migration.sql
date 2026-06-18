/*
  Warnings:

  - You are about to drop the column `aiProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "aiApiStatus" AS ENUM ('RUNNING', 'INVALID', 'TOKENREACHED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiProvider",
DROP COLUMN "apiKey";

-- CreateTable
CREATE TABLE "AiApi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerid" TEXT NOT NULL,
    "aiProvider" "AiProvider" NOT NULL DEFAULT 'GEMINI',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "tokenUsed" INTEGER NOT NULL,
    "totalGenaration" INTEGER NOT NULL,
    "status" "aiApiStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiApi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiApi" ADD CONSTRAINT "AiApi_ownerid_fkey" FOREIGN KEY ("ownerid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
