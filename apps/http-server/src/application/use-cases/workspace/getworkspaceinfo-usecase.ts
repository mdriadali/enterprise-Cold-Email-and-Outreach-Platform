import type { IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import { PlanService } from "@repo/config";


export class GetWorkspaceInfoUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository
    ) { }
    async execute(workspaceid: string) {
        WorkspaceValidator.validateId(workspaceid)
        const info = await this.workspaceRepository.info(workspaceid)
        WorkspaceValidator.validateInfoData(info)
        const owner = info?.members.find(member => member.role === "OWNER")
      const limits=  PlanService.getLimits(owner!.user.subscription)
        return {limits,info}
    }
}