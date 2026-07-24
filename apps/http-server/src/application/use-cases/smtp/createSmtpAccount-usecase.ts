import type { SmtpCreateInputData } from "@repo/types";
import { SmtpValidator } from "../../../domain/smtp/smtpValidator";
import type { ISmtpAccountRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import { PlanService } from "@repo/config";

export class CreateSmtpAccountuseCase {
    constructor(
        private readonly smtpAccountRepository: ISmtpAccountRepository,
        private readonly workspaceRepository: IWorkspaceRepository
    ) { }
    async execute(inputData: SmtpCreateInputData) {
        SmtpValidator.inputDataValidate(inputData)


        const workspaceInfo = await this.workspaceRepository.info(inputData.workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        const limit = PlanService.getLimits(workspaceInfo?.subscription!)

        SmtpValidator.validateSmtpLimit(limit.smtpAccounts, workspaceInfo?._count.smtpAccounts!)
        
        const create = await this.smtpAccountRepository.create(inputData)
        return create
    }
}