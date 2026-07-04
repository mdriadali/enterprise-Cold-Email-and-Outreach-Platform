import { prismaClient } from "@repo/db";
import type { ISmtpAccountRepository } from "@repo/ports";
import type { SmtpCreateInputData, SmtpData } from "@repo/types";

export class PrismaSmtpAccountRepository implements ISmtpAccountRepository{
    async create(data: SmtpCreateInputData): Promise<SmtpData> {
        const create=await prismaClient.smtpAccount.create({
            data:{
                workspaceId:data.workspaceId,
                name:data.name,
                host:data.host,
                port:data.port,
                username:data.username,
                password:data.password,
                fromName:data.fromName,
                fromEmail:data.fromEmail,
                replyTo:data.replyTo,
                encryption:data.encryption,
                
            }
        })
        return create

    }
}