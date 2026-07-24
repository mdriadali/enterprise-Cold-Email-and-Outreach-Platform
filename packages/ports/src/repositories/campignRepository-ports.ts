import type { Campaign, CampaignStatus } from "@repo/db";
import type { CampaignData, CreateCampaignInput, Updatecampaign } from "@repo/types";

export interface ICampaignRepository {
    create(data: CreateCampaignInput): Promise<CampaignData>
    updateStatus(campaignId: string, workspaceId: string, status: CampaignStatus): Promise<CampaignData>
    updateStatusByID(id:string , status:CampaignStatus):Promise<CampaignData|null>
    findById(id: string): Promise<CampaignData|null>
    findByIdAndWorkspaceId(id: string, workspaceId: string): Promise<CampaignData | null>
    findByNextRunAtAndStatus(nextRunAt: Date, status: CampaignStatus): Promise<CampaignData[] | null>
    updateById(id:string, data:Updatecampaign):Promise<CampaignData|null>
    updatebyIdAndWorkspaceId(id:string, workspaceId:string,data:Updatecampaign):Promise<CampaignData|null>
    findCampaignContext(id:string):Promise<CampaignData|null>
    delete(id:string,workspaceId:string, ownerId:string):Promise<Campaign>
}