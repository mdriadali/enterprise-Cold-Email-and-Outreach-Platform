import type { GenerationJobStatus } from "./enums";

export interface GenerationJobData {
    id: string,
    workspaceId: string,
    status: GenerationJobStatus,
    createdAt: Date,
    updatedAt: Date
}
