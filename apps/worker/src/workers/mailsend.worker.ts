import { queueConnection } from "@repo/queue";
import { Worker } from "bullmq";
import { mailSendUseCase } from "../container/mailSendUsecase-dependencies";


console.log("Campaign mail send  Worker started")

new Worker("campaign-mail-send",
    async (job) => {
        const { campaignId, minDelay, maxDelay } = job.data
        try {
            const sendMail = await mailSendUseCase.execute(campaignId, minDelay, maxDelay)
        } catch (error) {
            console.log("campaign mail send worker", error)
        }
    },
    {
        connection: queueConnection as any,
        concurrency: 10
    }

)