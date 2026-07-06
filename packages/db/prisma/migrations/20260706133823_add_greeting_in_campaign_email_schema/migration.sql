/*
  Warnings:

  - Added the required column `greeting` to the `CampaignEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignEmail" ADD COLUMN     "greeting" TEXT NOT NULL;
