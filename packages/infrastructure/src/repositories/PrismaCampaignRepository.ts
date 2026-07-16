import { CampaignStatus, prismaClient } from "@repo/db";
import type { ICampaignRepository } from "@repo/ports";
import type { CampaignData, CreateCampaignInput } from "@repo/types";

export class PrismaCampaignRepository implements ICampaignRepository {
    async create(data: CreateCampaignInput): Promise<CampaignData> {
        const campaign = await prismaClient.campaign.create({
            data: {
                workspaceId: data.workspaceId,
                name: data.name,
                description: data.description,
                timezone: data.timezone,
                startAt: data.startAt,
                endAt: data.endAt,
                dailyLimit: data.dailyLimit,
                sendingFromHour: data.sendingFromHour,
                sendingToHour: data.sendingToHour,
                nextRunAt:data.nextRunAt,
                randomDelayMin: data.randomDelayMin,
                followUpEnabled: data.followUpEnabled,
                stopOnReply: data.stopOnReply,
                stopOnBounce: data.stopOnBounce,
                createdById: data.createdById,
                smtpAccountId: data.smtpAccountId

            }
        })
        return campaign
    }

    async findByIdAndWorkspaceId(id: string, workspaceId: string): Promise<CampaignData | null> {
        const campaign = await prismaClient.campaign.findUnique({
            where: {
                id,
                workspaceId
            }
        })

        if (!campaign) {
            return null
        }
        return campaign
    }

    async updateStatus(campaignId: string, workspaceId: string, status: CampaignStatus): Promise<CampaignData> {
        const update = await prismaClient.campaign.update({
            where: {
                id: campaignId,
                workspaceId: workspaceId
            },
            data: {
                status: status
            }
        })

        return update
    }

    async findByNextRunAtAndStatus(nextRunAt:Date,status: CampaignStatus): Promise<CampaignData[] | null> {
        const campaigns = await prismaClient.campaign.findMany({
            where: {
                nextRunAt:{
                    lte:nextRunAt
                },
                status: status
            },
            include:{
                _count:{
                    select:{
                        campaignEmail:true
                    }
                }
            }
        })
        if (!campaigns) {
            return []
        }
        return campaigns
    }
}