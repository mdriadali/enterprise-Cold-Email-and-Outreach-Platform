import type { ICampaignEmailRepository, ICampaignRepository } from "@repo/ports";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";

export class SchudleCampaignUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository,
        private readonly campaignEmailRepository:ICampaignEmailRepository
    ) { }
    async execute(workspaceId: string, campaignId: string) {
        const campaign = await this.campaignRepository.findByIdAndWorkspaceId(campaignId, workspaceId)


        CampaignValidator.alredyThisStatus(campaign,"SCHEDULED")

        CampaignValidator.isStatusDraft(campaign)

        CampaignValidator.validateCampaignData(campaign)
         const totalEmails=await this.campaignEmailRepository.campaignEmailsCount(campaignId,workspaceId)

         CampaignValidator.isemailsExist(totalEmails)
         const updateCampaign=await this.campaignRepository.updateStatus(campaignId,workspaceId,"SCHEDULED")

    }
}