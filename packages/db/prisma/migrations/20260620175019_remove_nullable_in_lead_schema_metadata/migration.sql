/*
  Warnings:

  - Made the column `metadata` on table `Lead` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "metadata" SET NOT NULL;
