import type { IWorkspaceMemberRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";

export class DeleteMemberUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly workspaceMemberRepository:IWorkspaceMemberRepository

    ) { }

    async execute(workspaceId: string, memberId: string, userId: string) {

        const workspace = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspace)
        WorkspaceValidator.isOwner(userId, workspace?.ownerId!)

        WorkspaceValidator.validateRemoveMember(memberId, workspace?.ownerId!)
        const remove=await this.workspaceMemberRepository.delete(workspaceId,memberId)
        WorkspaceValidator.validateMemberdata(remove)
        return remove
    }
}