import type { IGenerationJobRepository } from "@repo/ports";

export class FindGenerationJobsUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(workspaceId: string, page: number) {
        return this.generationJobRepository.findByWorkspaceId(workspaceId, page)
    }
}