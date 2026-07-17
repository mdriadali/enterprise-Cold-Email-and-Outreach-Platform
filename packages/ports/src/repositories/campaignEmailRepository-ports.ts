import type { CampaignEmailStatus } from "@repo/db";
import type { CampaignEmailCreateData, CampaingEmailData } from "@repo/types";

export interface ICampaignEmailRepository{
    create(createData:CampaignEmailCreateData):Promise<CampaingEmailData>
    createMany(createData:CampaignEmailCreateData[]):Promise<void>
    campaignEmailsCount(campaignId:string,workspaceId:string):Promise<number>
}