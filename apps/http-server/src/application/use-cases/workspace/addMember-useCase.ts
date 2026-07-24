import type { IUserRepository, IWorkspaceMemberRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import type { WorkspaceMemberRole } from "@repo/db";
import { UserValidator } from "../../../domain/user/UserValidator";
import { PlanService } from "@repo/config";

export class AddMemberUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
        private readonly userRepository: IUserRepository
    ) { }
    async execute(workspaceId: string, ownerId: string, email: string, role: WorkspaceMemberRole) {

        WorkspaceValidator.roleNotowner(role)

        const workspace = await this.workspaceRepository.info(workspaceId)

        WorkspaceValidator.validateInfoData(workspace)
        WorkspaceValidator.isOwner(ownerId, workspace?.ownerId!)
        
        const limit = PlanService.getLimits(workspace?.subscription!)
        WorkspaceValidator.validateMemberLimit(limit.members, workspace?._count.members!)



        const user = await this.userRepository.findByEmail(email)

        UserValidator.UserNotExist(user)

        const add = await this.workspaceMemberRepository.create({ workspaceId: workspaceId, memberId: user?.id!, role: role })


        return add


    }
}