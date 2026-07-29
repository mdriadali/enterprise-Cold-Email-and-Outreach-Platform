import type { IGenerationJobRepository } from "@repo/ports";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";

export class GetGenerationJobUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(workspaceId:string,generationJobId: string,) {
        GenerationJobValidator.validateGenerationId(generationJobId)
        const generationJob = await this.generationJobRepository.findByIdWorkspaceId(generationJobId,workspaceId)
        GenerationJobValidator.isGenerationJobExist(generationJob)
        return generationJob
    }
}