import { DateHelper } from "@repo/common";
import type { ICampaignRepository } from "@repo/ports";
import { campaignMailSendQueue } from "@repo/queue";
import { Campaignvalidator } from "../../domain/campaignValidator";


export class ScheduleTodayCampaignUseCase {
    constructor(
        private readonly campaignRepository: ICampaignRepository
    ) { }
    async execute() {
        const nextRunAt = new Date();

        const campaigns = await this.campaignRepository.findByNextRunAtAndStatus(nextRunAt, "SCHEDULED")


        await Promise.all(
            campaigns?.map(async (campaign) => {

                Campaignvalidator.isMailExist(campaign._count?.campaignEmail!)

                const sendingStartLocaldate = DateHelper.toLocalDate(campaign.startAt!, campaign.timezone)

                const sendingStartUtcDate = DateHelper.getUtcDateTime(sendingStartLocaldate, campaign.sendingFromHour!, campaign.timezone)

                const sendingStopUtcDate = DateHelper.getUtcDateTime(sendingStartLocaldate, campaign.sendingToHour!, campaign.timezone)
                const maxDelay = ((sendingStopUtcDate.getTime() - sendingStartUtcDate.getTime()) / campaign._count?.campaignEmail!) / 1000

                const delay = Math.max(0, sendingStartUtcDate.getTime() - Date.now())

                await campaignMailSendQueue.add(
                    "mail-send",
                    { campaignId: campaign.id, minDelay:campaign.randomDelayMin, maxDelay: maxDelay },
                    {
                        delay: delay,
                        jobId: `campaign-${campaign.id}`,
                        removeOnComplete: true,
                        removeOnFail: true,
                    }
                )

                await this.campaignRepository.updateStatus(campaign.id, campaign.workspaceId, "QUEUED")

            }) ?? []

        )

    }
}