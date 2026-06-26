/*
  Warnings:

  - The values [STOP] on the enum `aiApiStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "aiApiStatus_new" AS ENUM ('AVAILABLE', 'RATE_LIMITED', 'INVALID', 'DISABLED');
ALTER TABLE "public"."AiApi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AiApi" ALTER COLUMN "status" TYPE "aiApiStatus_new" USING ("status"::text::"aiApiStatus_new");
ALTER TYPE "aiApiStatus" RENAME TO "aiApiStatus_old";
ALTER TYPE "aiApiStatus_new" RENAME TO "aiApiStatus";
DROP TYPE "public"."aiApiStatus_old";
ALTER TABLE "AiApi" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;
