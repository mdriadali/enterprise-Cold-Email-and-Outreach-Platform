export interface ICampaignqueue{
    addMailSendQueue( campaignId: string, delay:number,minDelay:number, maxDelay: number ):Promise<void>
    removeMailSendQueue(campaignId:string):Promise<void>
}