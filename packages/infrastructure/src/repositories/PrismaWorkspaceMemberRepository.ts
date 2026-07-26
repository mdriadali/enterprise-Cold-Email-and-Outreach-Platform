import type { workspaceMemberCreateData, workspaceMemberData } from "@repo/types";
import { prismaClient } from "@repo/db";
import type { IWorkspaceMemberRepository } from "@repo/ports";

export class PrismaWorkspaceMember implements IWorkspaceMemberRepository {
    async create(data: workspaceMemberCreateData): Promise<workspaceMemberData> {
        const newMember = await prismaClient.workspaceMember.create({
            data: {
                workspaceId: data.workspaceId,
                userId: data.memberId,
                role: data.role
            }
        })

        return newMember
    }


    async findByWorkspaceAndUser(workspaceId: string, userId: string): Promise<workspaceMemberData | null> {
        const workspaceMember = await prismaClient.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
        });
        return workspaceMember
    }

    async delete(workspaceId: string, memberId: string): Promise<workspaceMemberData|null> {
        return  await prismaClient.workspaceMember.delete({
            where:{
                id:memberId,
                workspaceId:workspaceId,
            }
        })
    }

    async findbyUserId(userId: string): Promise<workspaceMemberData[]> {
       return await prismaClient.workspaceMember.findMany({
            where:{
                userId:userId
            }
        })
    }
}