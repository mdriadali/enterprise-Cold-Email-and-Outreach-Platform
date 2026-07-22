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
        const limits = PlanService.getLimits(info?.subscription!)
        return { limits, info }
    }
}

