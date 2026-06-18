import { prismaClient, type AiProvider } from "@repo/db";
import type { IAiApiRepository } from "../../application/ports/repositories/AiApiRepository-ports";
import type { aiApiData } from "@repo/types";

export class PrismaAiApiRepository implements IAiApiRepository {
    async create(ownerId:string,provider: AiProvider, key: string): Promise<aiApiData> {
        const createApi = await prismaClient.aiApi.create({
            data: {
                ownerId:ownerId,
                aiProvider:provider,
                apiKey:key
            }
        })
        return createApi
    }
}