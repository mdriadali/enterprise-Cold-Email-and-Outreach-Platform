import { CampaignEmailStatus, prismaClient } from "@repo/db";
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
        const campaignEmail = await prismaClient.campaignEmail.createMany({
            data: createData
        })

    }



    async findFirst(campaignId: string, status: CampaignEmailStatus): Promise<CampaingEmailData | null> {
        const mail = await prismaClient.campaignEmail.findFirst({
            where: {
                campaignId,
                status: status
            }
        })

        return mail

    }
    async campaignEmailsCount(campaignId: string, workspaceId: string): Promise<number> {
        return await prismaClient.campaignEmail.count({
            where: {
                campaignId,
                campaign: {
                    workspaceId,
                },
            },
        });
    }

    async updateStatus(id: string, status: CampaignEmailStatus): Promise<CampaingEmailData | null> {
        const update = await prismaClient.campaignEmail.update({
            where: {
                id
            },
            data: {
                status
            }
        })
        if (!update) {
            return null
        }
        return update
    }
}