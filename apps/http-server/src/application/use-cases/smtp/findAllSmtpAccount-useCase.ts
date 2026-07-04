import type { ISmtpAccountRepository } from "@repo/ports";
import { WorkspaceValidator } from "../../../domain/workspace/workspaceValidator";

export class FindAllSmtpAccountUseCase {
    constructor(
private readonly smtpAccountRepository:ISmtpAccountRepository
    ) { }
    async execute(workspaceId: string) {
        WorkspaceValidator.validateId(workspaceId)
        const accounts=await this.smtpAccountRepository.findByWorkspaceId(workspaceId)
        return accounts
    }
}