import type { AuthEmailJobData } from "@repo/types";

export interface IAuthEmailQueue {
    addEmailJob(data: AuthEmailJobData): Promise<void>;
}
