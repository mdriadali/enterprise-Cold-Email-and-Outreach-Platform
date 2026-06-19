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
}