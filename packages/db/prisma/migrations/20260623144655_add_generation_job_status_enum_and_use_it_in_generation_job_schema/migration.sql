/*
  Warnings:

  - The `status` column on the `GenerationJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "GenerationJob" DROP COLUMN "status",
ADD COLUMN     "status" "GenerationJobStatus" NOT NULL DEFAULT 'PENDING';
