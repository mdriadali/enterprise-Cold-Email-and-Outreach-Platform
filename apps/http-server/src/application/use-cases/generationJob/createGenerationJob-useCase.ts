import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";
import type { IGenerationJobRepository } from "../../ports/repositories/GenerationJobRepository-ports";
import type { IWorkspaceMemberRepository } from "../../ports/repositories/WorkspaceMemberRepository-ports";

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