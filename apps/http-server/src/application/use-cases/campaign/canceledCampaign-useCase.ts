import type { ICampaignEmailRepository, ICampaignqueue, ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class CanceledcampaignuseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository,
        private readonly campaignqueue: ICampaignqueue,
        private readonly campaignEmailRepository: ICampaignEmailRepository
    ) { }
    async execute(workspaceId: string, campaignId: string) {

        await this.campaignEmailRepository.delete(campaignId, workspaceId)
        const remove = await this.campaignRepository.delete(campaignId, workspaceId)
        CampaignValidator.validateCampaignData(remove)
        await this.campaignqueue.removeMailSendQueue(campaignId)
        return true
    }
}