import type { IGenerationJobRepository } from "@repo/ports";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";

export class UpdateGenerationJobUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(workspaceId: string, generationJobId: string, name: string) {
        GenerationJobValidator.validateGenerationId(generationJobId)
        const job = await this.generationJobRepository.findByIdWorkspaceId(generationJobId, workspaceId)
        GenerationJobValidator.isGenerationJobExist(job)
        return this.generationJobRepository.update(generationJobId, { name })
    }
}