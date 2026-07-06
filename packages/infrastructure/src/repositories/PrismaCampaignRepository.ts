import { prismaClient } from "@repo/db";
import type { ICampaignRepository } from "@repo/ports";
import type { CampaignData, CreateCampaignInput } from "@repo/types";

export class PrismaCampaignRepository implements ICampaignRepository {
    async create(data: CreateCampaignInput): Promise<CampaignData > {
        const campaign=await prismaClient.campaign.create({
            data:{
                workspaceId:data.workspaceId,
                name:data.name,
                description:data.description,
                timezone:data.timezone,
                startAt:data.startAt,
                endAt:data.endAt,
                dailyLimit:data.dailyLimit,
                sendingFromHour:data.sendingFromHour,
                sendingToHour:data.sendingToHour,
                randomDelayMin:data.randomDelayMin,
                followUpEnabled:data.followUpEnabled,
                stopOnReply:data.stopOnReply,
                stopOnBounce:data.stopOnBounce,
                createdById:data.createdById,
                smtpAccountId:data.smtpAccountId

            }
        })
        return campaign
    }
}