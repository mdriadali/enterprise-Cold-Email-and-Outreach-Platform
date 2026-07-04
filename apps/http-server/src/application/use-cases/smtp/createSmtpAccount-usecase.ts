import type { SmtpCreateInputData } from "@repo/types";
import { SmtpValidator } from "../../../domain/smtp/smtpValidator";
import type { ISmtpAccountRepository } from "@repo/ports";

export class CreateSmtpAccountuseCase {
    constructor(
        private readonly smtpAccountRepository: ISmtpAccountRepository
    ) { }
    async execute(inputData: SmtpCreateInputData) {
        SmtpValidator.inputDataValidate(inputData)
        const create = await this.smtpAccountRepository.create(inputData)
        return create
    }
}