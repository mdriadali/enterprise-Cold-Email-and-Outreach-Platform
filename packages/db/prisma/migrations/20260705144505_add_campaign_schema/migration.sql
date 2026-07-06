-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "dailyLimit" INTEGER NOT NULL DEFAULT 50,
    "sendingFromHour" INTEGER,
    "sendingToHour" INTEGER,
    "randomDelayMin" INTEGER,
    "randomDelayMax" INTEGER,
    "followUpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stopOnReply" BOOLEAN NOT NULL DEFAULT true,
    "stopOnBounce" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "smtpAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_workspaceId_idx" ON "Campaign"("workspaceId");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_smtpAccountId_fkey" FOREIGN KEY ("smtpAccountId") REFERENCES "SmtpAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
