import { aiApiStatus, prismaClient, type AiProvider } from "@repo/db";
import type { IAiApiRepository } from "@repo/ports";
import type { aiApiData, ApiSummary } from "@repo/types";

export class PrismaAiApiRepository implements IAiApiRepository {
    async create(ownerId: string, workspaceid: string, provider: AiProvider, key: string): Promise<aiApiData> {
        const createApi = await prismaClient.aiApi.create({
            data: {
                ownerId: ownerId,
                workspaceId: workspaceid,
                aiProvider: provider,
                apiKey: key
            }
        })
        return createApi
    }

    async findByWorkspaceId(workspaceId: string): Promise<aiApiData[]> {
        const apis = await prismaClient.aiApi.findMany({
            where: {
                workspaceId
            }
        })

        if (!apis) {
            return []
        }
        return apis
    }

    async getApiSummary(workspaceId: string): Promise<ApiSummary> {
        const result = await prismaClient.aiApi.groupBy({
            by: ["status"],
            where: {
                workspaceId:workspaceId
            },
            _count: {
                status: true,
            },
        });

        const summary: ApiSummary = {
            total: 0,
            available: 0,
            rateLimited: 0,
            invalid: 0,
        };

        for (const row of result) {
            summary.total += row._count.status;

            switch (row.status) {
                case "AVAILABLE":
                    summary.available = row._count.status;
                    break;

                case "RATE_LIMITED":
                    summary.rateLimited = row._count.status;
                    break;

                case "INVALID":
                    summary.invalid = row._count.status;
                    break;
            }
        }

        return summary;
    }

    async updateStatus(id: string, status: aiApiStatus): Promise<aiApiData> {
        const update = await prismaClient.aiApi.update({
            where: {
                id
            },
            data: {
                status: status
            }
        })

        return update
    }

    async findAvailableByWorkspaceId(workspaceId: string): Promise<aiApiData[]> {
        const find = await prismaClient.aiApi.findMany({
            where: {
                workspaceId: workspaceId,
                status: "AVAILABLE"
            }
        })
        return find
    }

    async updateByIdAndWorkspaceId(id: string, workspaceId: string, provider: AiProvider, key: string): Promise<aiApiData> {
        return await prismaClient.aiApi.update({
            where: {
                id,
                workspaceId
            },
            data: {
                aiProvider: provider,
                apiKey: key
            }
        })
    }

    async delete(id: string, workspaceId: string): Promise<aiApiData> {
        return await prismaClient.aiApi.delete({
            where: {
                id,
                workspaceId
            }
        })
    }
}