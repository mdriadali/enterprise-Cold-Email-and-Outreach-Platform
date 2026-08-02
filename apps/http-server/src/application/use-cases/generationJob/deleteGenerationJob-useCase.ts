import type { IGenerationJobRepository, ILeadRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";

export class DeleteGenerationJobUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly generationJobRepository: IGenerationJobRepository,
        private readonly leadRepository: ILeadRepository
    ) { }
    async execute(workspaceId: string, generationJobId: string, userId: string) {

        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        WorkspaceValidator.isOwner(userId, workspaceInfo?.ownerId!)

        const job = await this.generationJobRepository.findByIdWorkspaceId(generationJobId, workspaceId)

        GenerationJobValidator.isGenerationJobExist(job)

        await this.leadRepository.deleteByGenerationJobId(generationJobId)

        return this.generationJobRepository.delete(generationJobId, workspaceId)
    }
}