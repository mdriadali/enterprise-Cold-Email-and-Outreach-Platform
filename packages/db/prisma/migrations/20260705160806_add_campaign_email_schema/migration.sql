-- CreateEnum
CREATE TYPE "CampaignEmailStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'BOUNCED', 'REPLIED');

-- CreateTable
CREATE TABLE "CampaignEmail" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "signature" TEXT,
    "smtpId" TEXT,
    "stepNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "CampaignEmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignEmail_campaignId_idx" ON "CampaignEmail"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignEmail_status_idx" ON "CampaignEmail"("status");

-- AddForeignKey
ALTER TABLE "CampaignEmail" ADD CONSTRAINT "CampaignEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
