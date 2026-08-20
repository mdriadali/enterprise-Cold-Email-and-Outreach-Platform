import { Worker } from "bullmq";
import { queueConnection } from "@repo/queue";
import { sendAuthEmailUseCase } from "../container/authEmail-dependencies";
import type { AuthEmailJobData } from "@repo/types";

console.log("Email sending Worker started")

new Worker(
    "email-sending",
    async (job) => {
        const data = job.data as AuthEmailJobData
        try {
            await sendAuthEmailUseCase.execute(data)
        } catch (error) {
            console.log("email sending worker", error)
        }
    },
    {
        connection: queueConnection as any,
        concurrency: 5
    }
)
