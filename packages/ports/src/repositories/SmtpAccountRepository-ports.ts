import type { SmtpCreateInputData, SmtpData, SmtpUpdateData } from "@repo/types";

export interface ISmtpAccountRepository{
    create(data:SmtpCreateInputData):Promise<SmtpData>
    findById(id:string):Promise<SmtpData|null>
    findByIdAndWorspaceId(id:string, workspaceId:string):Promise<SmtpData|null>
    findByWorkspaceId(workspaceId:string):Promise<SmtpData[]>
    updateByIdAndWorkspaceId(id:string,workspaceId:string, data: SmtpUpdateData):Promise<SmtpData|null>
}