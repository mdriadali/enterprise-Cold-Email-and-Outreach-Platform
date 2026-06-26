import type { IGenerationJobRepository, IWorkspaceMemberRepository } from "@repo/ports";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";


export class CreategenerationJobUseCase {
    constructor(
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(userId: string, workspaceId: string) {
        GenerationJobValidator.validateCreateData(workspaceId)
        const findWorkspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId)
        GenerationJobValidator.validatememberdata(findWorkspaceMember)
        const newjob = await this.generationJobRepository.create(workspaceId)
        return newjob
    }
}