import { GenerationJobStatus, prismaClient } from "@repo/db";
import type { IGenerationJobRepository } from "@repo/ports";
import type { GenerationJobData } from "@repo/types";

export class PrismaGenerationJobRepository implements IGenerationJobRepository {

    async create(workspaceId: string , name:string): Promise<GenerationJobData> {
        const createJob = await prismaClient.generationJob.create({
            data: {
                name:name,
                workspaceId
            }
        })

        return createJob
    }
    async findById(jobId: string): Promise<GenerationJobData |null> {
        const job = await prismaClient.generationJob.findUnique({
            where: {
                id: jobId
            }
        })
        if (!job) {
            return null;
        }
        return job
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

    async updateStatusById(id: string,status:GenerationJobStatus ,errorMassage?:string): Promise<GenerationJobData> {
        const updatejob=await prismaClient.generationJob.update({
            where:{
                id
            },
            data:{
                status:status,
                errorMessage:errorMassage
            }
        })
        return updatejob
    }

    async updateCounters(id: string, data: { successCount?: number; failedCount?: number; pendingCount?: number; }): Promise<void> {
        const update=await prismaClient.generationJob.update({
            where:{
                id
            },
            data:{
                successCount:data.successCount,
                failedCount:data.successCount,
                pendingCount:data.pendingCount
            }
        })
    }
}