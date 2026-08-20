import type { IAuthEmailQueue } from "@repo/ports";
import { emailSendingQueue } from "@repo/queue";
import type { AuthEmailJobData } from "@repo/types";

export class RedisAuthEmailQueue implements IAuthEmailQueue {
    async addEmailJob(data: AuthEmailJobData): Promise<void> {
        await emailSendingQueue.add(
            "auth-email",
            data,
            {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
            }
        );
    }
}
