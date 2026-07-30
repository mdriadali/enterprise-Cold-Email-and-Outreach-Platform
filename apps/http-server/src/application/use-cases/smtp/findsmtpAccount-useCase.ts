import type { ISmtpAccountRepository } from "@repo/ports";
import { SmtpValidator } from "../../../domain/smtp/smtpValidator";

export class FindSmtpAccountUseCase {
    constructor(
        private readonly smtpAccountRepository: ISmtpAccountRepository
    ) { }
    async execute(id: string, workspaceId: string) {
        const smtp = await this.smtpAccountRepository.findByIdAndWorspaceId(id, workspaceId)

        SmtpValidator.validateSmtpData(smtp)
        return smtp
    }
}