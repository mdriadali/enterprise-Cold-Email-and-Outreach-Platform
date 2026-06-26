-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN     "failedCount" INTEGER,
ADD COLUMN     "pendingCount" INTEGER,
ADD COLUMN     "successCount" INTEGER;
