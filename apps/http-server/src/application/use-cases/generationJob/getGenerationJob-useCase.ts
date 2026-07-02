import type { IGenerationJobRepository } from "@repo/ports";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";

export class GetGenerationJobUseCase {
    constructor(
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(workspaceId:string,generationJobId: string,) {
        GenerationJobValidator.validateGenerationId(generationJobId)
        const generationJob = await this.generationJobRepository.findById(workspaceId,generationJobId)
        GenerationJobValidator.isGenerationJobExist(generationJob)
        return generationJob
    }
}