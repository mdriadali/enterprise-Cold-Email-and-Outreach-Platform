import type { ICampaignqueue } from "@repo/ports";
import { campaignMailSendQueue } from "@repo/queue";

export class RedisCampaignQueue implements ICampaignqueue {
    async addMailSendQueue(campaignId: string, delay: number, minDelay: number, maxDelay: number): Promise<void> {
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

    async removeMailSendQueue(campaignId: string): Promise<void> {
        const job = await campaignMailSendQueue.getJob(`campaign-${campaignId}`);
        if (job) {
            await job.remove();
        }

    }
}