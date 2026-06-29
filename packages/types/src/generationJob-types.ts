import type { GenerationJobStatus } from "@repo/db";

export interface GenerationJobData {
    id: string,
    workspaceId: string,
    status: GenerationJobStatus,
    createdAt: Date,
    updatedAt: Date
}