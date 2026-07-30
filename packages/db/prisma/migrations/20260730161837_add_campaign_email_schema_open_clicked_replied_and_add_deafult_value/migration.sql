/*
  Warnings:

  - You are about to drop the column `clickedAt` on the `CampaignEmail` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `CampaignEmail` table. All the data in the column will be lost.
  - You are about to drop the column `repliedAt` on the `CampaignEmail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CampaignEmail" DROP COLUMN "clickedAt",
DROP COLUMN "openedAt",
DROP COLUMN "repliedAt",
ADD COLUMN     "clicked" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "opened" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "replied" INTEGER NOT NULL DEFAULT 0;
