import type { SmtpUpdateData } from "@repo/types";
import { SmtpValidator } from "../../../domain/smtp/smtpValidator";
import type { ISmtpAccountRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";

export class UpdateSmtpAccountUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly smtpAccountRepository: ISmtpAccountRepository
    ) { }

    async execute(workspaceId: string, smtpId: string, userId: string, data: SmtpUpdateData) {

        SmtpValidator.validateUpdateData(data)

        const workspaceInfo = await this.workspaceRepository.info(workspaceId)

        WorkspaceValidator.validateInfoData(workspaceInfo)
        WorkspaceValidator.isOwner(userId, workspaceInfo?.ownerId!)
        const update = await this.smtpAccountRepository.updateByIdAndWorkspaceId(smtpId, workspaceId, data)


        SmtpValidator.validateSmtpData(update)

        return update

    }
}