import type { GenerationJobStatus } from "@repo/db";
import type { GenerationJobData } from "@repo/types";

export interface IGenerationJobRepository {
    create(workspaceId: string): Promise<GenerationJobData>
    findById(jobId: string): Promise<GenerationJobData | null>
    findByidAndworkspaceMember(userId: string, generationJobId: string): Promise<GenerationJobData | null>
    updateStatusById(id: string, status: GenerationJobStatus, errorMassage?: string): Promise<GenerationJobData>
    updateCounters(id: string,
        data: {
            successCount?: number;
            failedCount?: number;
            pendingCount?: number;
        }
    ): Promise<void>

}