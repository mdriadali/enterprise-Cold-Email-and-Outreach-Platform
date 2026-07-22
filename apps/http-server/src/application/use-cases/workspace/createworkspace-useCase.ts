import type { IUserRepository, IWorkspaceMemberRepository, IWorkspaceRepository } from "@repo/ports"
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator"
import type { Subscription } from "@repo/db"
import { UserValidator } from "../../../domain/user/UserValidator"




export class CreateWorkspaceUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
        private readonly userRepository: IUserRepository
    ) { }
    async execute(userId: string, name: string, subscription: Subscription) {
        WorkspaceValidator.validateInputData(name, subscription)

        const user = await this.userRepository.findById(userId)

        UserValidator.UserNotExist(user)
        WorkspaceValidator.validateFreeWorkspaceQuota(subscription, user?.remainingFreeWorkspaces!)

        const newWorkspace = await this.workspaceRepository.create(userId, name, subscription)
        
        const newWorkspaceMember = await this.workspaceMemberRepository.create({
            workspaceId: newWorkspace.id,
            memberId: newWorkspace.ownerId,
            role: "OWNER"
        })

        if(subscription==="STARTER"){
        await this.userRepository.decrementFreeWorkspaceQuota(userId)
        }


        return {
            workspace: newWorkspace,
            member: newWorkspaceMember
        }
    }
}