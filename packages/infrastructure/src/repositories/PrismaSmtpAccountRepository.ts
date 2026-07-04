import { prismaClient } from "@repo/db";
import type { ISmtpAccountRepository } from "@repo/ports";
import type { SmtpCreateInputData, SmtpData } from "@repo/types";

export class PrismaSmtpAccountRepository implements ISmtpAccountRepository {
    async create(data: SmtpCreateInputData): Promise<SmtpData> {
        const create = await prismaClient.smtpAccount.create({
            data: {
                workspaceId: data.workspaceId,
                name: data.name,
                host: data.host,
                port: data.port,
                username: data.username,
                password: data.password,
                fromName: data.fromName,
                fromEmail: data.fromEmail,
                replyTo: data.replyTo,
                encryption: data.encryption,

            }
        })
        return create

    }
    async findByIdAndWorspaceId(id: string, workspaceId: string): Promise<SmtpData | null> {
        const smtp = await prismaClient.smtpAccount.findUnique({
            where: {
                id,
                workspaceId
            }
        })
        if (!smtp) {
            return null
        }
        return smtp
    }

    async findByWorkspaceId(workspaceId: string): Promise<SmtpData[]> {
        const smtps=await prismaClient.smtpAccount.findMany({
            where:{
                workspaceId
            }
        })
        if(!smtps){
            return []
        }
        return smtps
    }
}