import { Worker } from "bullmq";
import { aiApiRepository } from "../container/dependencies";

new Worker(
    "reset-api-key",

    async (RATE_LIMITED) => {
        console.log("[Quota Reset Worker] Job Received");


        const { apiId } = RATE_LIMITED.data as {
            apiId: string;
        }

        try {
            const updateStatus = await aiApiRepository.updateStatus(apiId, "AVAILABLE")
            console.log(`[Quota Reset Worker] ApiId ${apiId} Status Update Sucessfully `)
        } catch (error) {
            console.log(`[Quota Reset Worker] ApiId ${apiId} Status Update Unsucessfully `)
            console.log("Qota Reset Worker Internal error:", error)
        }

    }
)