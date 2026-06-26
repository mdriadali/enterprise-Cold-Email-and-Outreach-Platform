import { aiApiStatus, prismaClient, type AiProvider } from "@repo/db";
import type { IAiApiRepository } from "@repo/ports";
import type { aiApiData } from "@repo/types";

export class PrismaAiApiRepository implements IAiApiRepository {
    async create(ownerId: string, provider: AiProvider, key: string): Promise<aiApiData> {
        const createApi = await prismaClient.aiApi.create({
            data: {
                ownerId: ownerId,
                aiProvider: provider,
                apiKey: key
            }
        })
        return createApi
    }

    async findByOwnerId(ownerId: string): Promise<aiApiData[]> {
        const apis = await prismaClient.aiApi.findMany({
            where: {
                ownerId
            }
        })

        if (!apis) {
            return []
        }
        return apis
    }

    async updateStatus(id: string, status: aiApiStatus): Promise<void> {
        const update = await prismaClient.aiApi.update({
            where: {
                id
            },
            data: {
                status:status
            }
        })
    }

    async findAvailableByOwnerId(ownerId: string): Promise<aiApiData[]> {
        const find=await prismaClient.aiApi.findMany({
            where:{
                ownerId:ownerId,
                status:"AVAILABLE"
            }
        })
        return find
    }
}