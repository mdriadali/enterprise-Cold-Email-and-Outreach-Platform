import type { SmtpCreateInputData, SmtpData } from "@repo/types";

export interface ISmtpAccountRepository{
    create(data:SmtpCreateInputData):Promise<SmtpData>
}