import { AiProvider } from "@repo/db";
import { AiApiValidator } from "../../../domain/aiApi/aiapivalidator";
import type { IAiApiRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";

export class UpdateAiApiUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly aiApiRepository: IAiApiRepository
    ) { }
    async execute(workspaceId: string, id: string, userId: string, provider: AiProvider, key: string) {
        AiApiValidator.createInput(provider, key)

        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        WorkspaceValidator.isOwner(userId, workspaceInfo?.ownerId!)

        const update = await this.aiApiRepository.updateByIdAndWorkspaceId(id, workspaceId, provider, key)
        return update
    }
}