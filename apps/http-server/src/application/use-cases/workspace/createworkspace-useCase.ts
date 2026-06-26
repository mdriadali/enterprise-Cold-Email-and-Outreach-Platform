import type { IWorkspaceMemberRepository, IWorkspaceRepository } from "@repo/ports"
import { workspaceValidator } from "../../../domain/workspace/workspaceValidator"



export class CreateWorkspaceUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }
    async execute(userId: string, name: string) {
        console.log("[workspace create] trying user", userId)
        workspaceValidator.validateName(name)

        const newWorkspace = await this.workspaceRepository.create(userId, name)
        const newWorkspaceMember = await this.workspaceMemberRepository.create({
            workspaceId: newWorkspace.id,
            memberId: newWorkspace.ownerId,
            role: "OWNER"
        })

        return {
            workspace: newWorkspace,
            member: newWorkspaceMember
        }
    }
}