import { Worker } from "bullmq";
import { aiApiRepository } from "../container/dependencies";
import { queueConnection } from "@repo/queue";

new Worker(
    "reset-api-key",

    async (job) => {
        console.log("[Quota Reset Worker] Job Received");


        const { apiKeyId } = job.data as {
            apiKeyId: string;
        }

        try {
            const resetApiUsage = await aiApiRepository.updateStatus(apiKeyId,"AVAILABLE")
            console.log("Quota reset worker status:", resetApiUsage);
        } catch (error) {
            console.log("Qota Reset Worker Internal error:", error)
        }

    },
    {
        connection: queueConnection as any,
        concurrency: 5,
    }
)