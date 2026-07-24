import type { IGenerationJobRepository, IWorkspaceMemberRepository, IWorkspaceRepository } from "@repo/ports";
import { GenerationJobValidator } from "../../../domain/generationJob/generationJobvalidator";
import { PlanService } from "@repo/config";


export class CreategenerationJobUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly generationJobRepository: IGenerationJobRepository
    ) { }
    async execute(userId: string, workspaceId: string, name: string) {
        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        const limit = PlanService.getLimits(workspaceInfo?.subscription!)
        GenerationJobValidator.validateJobLimit(limit.generationJobs, workspaceInfo?._count.generationJob!)
        const newjob = await this.generationJobRepository.create(workspaceId, name)
        return newjob
    }
}