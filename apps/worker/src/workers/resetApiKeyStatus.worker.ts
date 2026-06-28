import { Worker } from "bullmq";
import { aiApiRepository } from "../container/dependencies";
import { queueConnection } from "@repo/queue";
console.log("Reset Api Key Status Worker Start");
new Worker(
    "reset-api-key-status",

    async (job) => {
        console.log("[Reset Api Key Status] Job Received");


        const { apiKeyId } = job.data as {
            apiKeyId: string;
        }

        try {
            const resetApiUsage = await aiApiRepository.updateStatus(apiKeyId, "AVAILABLE")
            if (!resetApiUsage) {
                console.log("[Reset Api Key Status] Api not found id :", apiKeyId)
            }

            console.log("[Reset Api Key Status] Sucessfully Api Id:", resetApiUsage.id);
        } catch (error) {
            console.log("Qota Reset Worker Internal error:", error)
        }

    },
    {
        connection: queueConnection as any,
        concurrency: 5,
    }
)