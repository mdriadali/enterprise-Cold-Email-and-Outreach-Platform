/*
  Warnings:

  - Made the column `failedCount` on table `GenerationJob` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pendingCount` on table `GenerationJob` required. This step will fail if there are existing NULL values in that column.
  - Made the column `successCount` on table `GenerationJob` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalLeads` on table `GenerationJob` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GenerationJob" ALTER COLUMN "failedCount" SET NOT NULL,
ALTER COLUMN "failedCount" SET DEFAULT 0,
ALTER COLUMN "pendingCount" SET NOT NULL,
ALTER COLUMN "pendingCount" SET DEFAULT 0,
ALTER COLUMN "successCount" SET NOT NULL,
ALTER COLUMN "successCount" SET DEFAULT 0,
ALTER COLUMN "totalLeads" SET NOT NULL,
ALTER COLUMN "totalLeads" SET DEFAULT 0;
