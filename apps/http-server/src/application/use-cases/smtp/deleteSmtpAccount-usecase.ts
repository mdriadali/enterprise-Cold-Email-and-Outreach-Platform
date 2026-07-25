import type { ISmtpAccountRepository, IWorkspaceRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";
import { SmtpValidator } from "../../../domain/smtp/smtpValidator";

export class DeleteSmtpAccountUseCase {
    constructor(
        private readonly workspaceRepository: IWorkspaceRepository,
        private readonly  smtpAccountRepository : ISmtpAccountRepository 
    ) { }

    async execute(workspaceId: string, smtpId: string, userId: string,) {
        const workspaceInfo = await this.workspaceRepository.info(workspaceId)
        WorkspaceValidator.validateInfoData(workspaceInfo)
        WorkspaceValidator.isOwner(userId, workspaceInfo?.ownerId!)

        const remove=await this.smtpAccountRepository.delete(smtpId,workspaceId)

        SmtpValidator.validateSmtpData(remove)
        return remove
    }
}