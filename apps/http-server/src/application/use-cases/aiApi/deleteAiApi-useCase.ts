import type { IAiApiRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";

export class DeleteAiApiUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly aiApiRepository: IAiApiRepository
    ) { }
    async execute(workspaceId: string, id: string, userId: string) {
        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        WorkspaceValidator.isOwner(userId, workspaceInfo?.ownerId!)

        const remove = await this.aiApiRepository.delete(id, workspaceId)
        return remove
    }
}