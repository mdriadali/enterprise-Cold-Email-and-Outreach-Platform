import { prismaClient } from "@repo/db";
import type { IGenerationJobRepository } from "../../application/ports/repositories/GenerationJobRepository-ports";
import type { GenerationJobData } from "@repo/types";

export class PrismaGenerationJobRepository implements IGenerationJobRepository {
    async create(workspaceId: string): Promise<GenerationJobData> {
        const createJob = await prismaClient.generationJob.create({
            data: {
                workspaceId
            }
        })

        return createJob
    }

    async findByidAndworkspaceMember(userId: string, generationJobId: string): Promise<GenerationJobData | null> {
        const job = await prismaClient.generationJob.findFirst({
            where: {
                id: generationJobId,
                workspace: {
                    OR: [
                        {
                            ownerId: userId
                        },
                        {
                            members: {
                                some: {
                                    userId
                                }
                            }
                        }
                    ]
                }

            }
        })
        return job
    }
}