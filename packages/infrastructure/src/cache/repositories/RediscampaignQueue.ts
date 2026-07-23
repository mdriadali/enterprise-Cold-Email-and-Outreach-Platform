import type { ICampaignqueue } from "@repo/ports";
import { campaignMailSendQueue } from "@repo/queue";

export class RedisCampaignQueue implements ICampaignqueue {
    async addMailSendQueue( campaignId: string, delay: number, minDelay: number, maxDelay: number): Promise<void> {
        await campaignMailSendQueue.add(
            "mail-send",
            { campaignId: campaignId, minDelay: minDelay, maxDelay: maxDelay },
            {
                delay: delay,
                jobId: `campaign-${campaignId}`,
                removeOnComplete: true,
                removeOnFail: true,
            }
        )
    }
}