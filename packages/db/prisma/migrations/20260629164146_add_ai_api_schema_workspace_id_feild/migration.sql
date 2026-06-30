/*
  Warnings:

  - Added the required column `workspaceId` to the `AiApi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiApi" ADD COLUMN     "workspaceId" TEXT NOT NULL DEFAULT '266810d7-b6f6-41b3-87a4-cbf91665c3a9';

-- AddForeignKey
ALTER TABLE "AiApi" ADD CONSTRAINT "AiApi_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
