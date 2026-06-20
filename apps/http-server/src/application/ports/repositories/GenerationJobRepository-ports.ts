import type { GenerationJobData } from "@repo/types";

export interface IGenerationJobRepository {
    create(workspaceId: string): Promise<GenerationJobData>
    findByidAndworkspaceMember(userId:string,generationJobId:string):Promise<GenerationJobData|null>
}