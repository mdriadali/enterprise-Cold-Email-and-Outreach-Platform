import type { ICampaignEmailRepository } from "@repo/ports";

export class AllCampaignEmailUseCase {
    constructor(
        private readonly campaignEmailRepository: ICampaignEmailRepository
    ) { }

    async execute(campaignid: string, workspaceId: string) {
        const emails = await this.campaignEmailRepository.find(campaignid, workspaceId)
        return emails
    }
}