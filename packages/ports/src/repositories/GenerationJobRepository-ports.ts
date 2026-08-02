import type { GenerationJobStatus } from "@repo/db";
import type { GenerationJobData } from "@repo/types";

export interface IGenerationJobRepository {
    create(workspaceId: string , name:string): Promise<GenerationJobData>
    findById(jobId: string): Promise<GenerationJobData | null>
    findByIdWorkspaceId(id: string,workspaceId: string): Promise<GenerationJobData | null>
    findByWorkspaceId(workspaceId: string, page: number): Promise<GenerationJobData[]>
    update(id: string, data: { name?: string }): Promise<GenerationJobData>
    delete(id: string, workspaceId: string): Promise<GenerationJobData>
    findByidAndworkspaceMember(userId: string, generationJobId: string): Promise<GenerationJobData | null>
    updateStatusById(id: string, status: GenerationJobStatus, errorMassage?: string): Promise<GenerationJobData>
    updateCounters(id: string,
        data: {
            totalLeads?:number
            successCount?: number;
            failedCount?: number;
            pendingCount?: number;
        }
    ): Promise<void>

}