/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `SmtpAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SmtpAccount" DROP COLUMN "updatedAt",
ADD COLUMN     "error" TEXT;
