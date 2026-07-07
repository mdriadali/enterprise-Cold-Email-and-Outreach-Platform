import type { CampaignEmailCreateData, CampaingEmailData } from "@repo/types";

export interface ICampaignEmailRepository{
    create(createData:CampaignEmailCreateData):Promise<CampaingEmailData>
    createMany(createData:CampaignEmailCreateData[]):Promise<void>
}