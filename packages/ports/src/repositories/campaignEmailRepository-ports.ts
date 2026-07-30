import type { CampaignEmailStatus } from "@repo/db";
import type { CampaignEmailCreateData, CampaingEmailData } from "@repo/types";

export interface ICampaignEmailRepository {
    create(createData: CampaignEmailCreateData): Promise<CampaingEmailData>
    createMany(createData: CampaignEmailCreateData[]): Promise<void>
    campaignEmailsCount(campaignId: string, workspaceId: string): Promise<number>
    find(campaignId:string,workspaceId:string):Promise <CampaingEmailData[]>
    findFirst(campaignId: string, status: CampaignEmailStatus): Promise<CampaingEmailData | null>
    updateStatus(id:string,status:CampaignEmailStatus):Promise<CampaingEmailData|null>
    updateError(id: string, errorMessage: string): Promise<CampaingEmailData | null>
    delete(campaignId:string,workspaceId:string):Promise<{count: number}>
}