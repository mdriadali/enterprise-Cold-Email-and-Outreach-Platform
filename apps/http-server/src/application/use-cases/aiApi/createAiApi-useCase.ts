import type { AiProvider } from "@repo/db";
import { AiApiValidator } from "../../../domain/aiApi/aiapivalidator";
import type { IAiApiRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import { PlanService } from "@repo/config";


export class CreateAiAPiUseCase {
    constructor(
        private readonly aiApiRepository: IAiApiRepository,
        private readonly workspaceRepository: IWorkspaceRepository
    ) { }
    async execute(userId: string, workspaceId: string, provider: AiProvider, apiKey: string) {

        AiApiValidator.createInput(provider, apiKey)

        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        const limit=PlanService.getLimits(workspaceInfo?.subscription!)

        AiApiValidator.validateAiApiLimit(limit.apiKeys,workspaceInfo?._count.AiApiKeys!)

        const newApi = await this.aiApiRepository.create(userId, workspaceId, provider, apiKey)
        return newApi
    }
}