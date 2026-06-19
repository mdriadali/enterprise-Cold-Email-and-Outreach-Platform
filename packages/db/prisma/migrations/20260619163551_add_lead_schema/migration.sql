-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "generationJobId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "LeadStatus" NOT NULL,
    "generatedEmailData" JSONB,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
