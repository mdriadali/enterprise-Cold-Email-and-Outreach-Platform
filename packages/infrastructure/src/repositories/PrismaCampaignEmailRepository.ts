import { prismaClient } from "@repo/db";
import type { ICampaignEmailRepository } from "@repo/ports";
import type { CampaignEmailCreateData, CampaingEmailData } from "@repo/types";

export class PrismaCampaignEmailRepository implements ICampaignEmailRepository {
    async create(createData: CampaignEmailCreateData): Promise<CampaingEmailData> {
        const campaignEmail = await prismaClient.campaignEmail.create({
            data: {
                campaignId: createData.campaignId,
                email: createData.email,
                subject: createData.subject,
                greeting: createData.greeting,
                body: createData.body,
                signature: createData.signature,
                smtpId: createData.smtpId
            }
        })
        return campaignEmail
    }

    async createMany(createData: CampaignEmailCreateData[]): Promise<void> {
        const campaignEmail=await prismaClient.campaignEmail.createMany({
            data:createData
        })
  
    }
}