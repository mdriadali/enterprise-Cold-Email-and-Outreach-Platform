/*
  Warnings:

  - You are about to drop the column `ownerid` on the `AiApi` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `AiApi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AiApi" DROP CONSTRAINT "AiApi_ownerid_fkey";

-- AlterTable
ALTER TABLE "AiApi" DROP COLUMN "ownerid",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiApi" ADD CONSTRAINT "AiApi_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
