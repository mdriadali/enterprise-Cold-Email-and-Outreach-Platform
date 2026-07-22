import { prismaClient, Subscription, type Workspace } from "@repo/db";
import type { IWorkspaceRepository } from "@repo/ports";

export class PrismaWorkspace implements IWorkspaceRepository {
  async create(userId: string, name: string,subscription:Subscription): Promise<Workspace> {
    const createWorkspace = await prismaClient.workspace.create({
      data: {
        name,
        ownerId: userId,
        subscription
      }
    })

    return createWorkspace
  }

  async findById(id: string): Promise<Workspace| null> {
    const workspace = await prismaClient.workspace.findUnique({
      where: {
        id
      }
    })
    if (!workspace) {
      return null
    }
    return workspace
  }

  async info(workspaceId: string): Promise<Workspace | null> {
      const info=await prismaClient.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,
        subscription:true,
        ownerId:true,


        _count: {
          select: {
            members: true,
            generationJob: true,
            AiApiKeys: true,
            smtpAccounts: true,
            campaign:true
          },
        },

        members: {
          take: 10,
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        generationJob: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          select: {
            id: true,
            name: true,
            status: true,
            totalLeads: true,
            successCount: true,
            failedCount: true,
            pendingCount: true,
            createdAt: true,
          },
        },

        AiApiKeys: {
          take: 10,
          select: {
            id: true,
            aiProvider: true,
            status: true,
          },
        },
      },
    });

    if(!info){
      return null
    }

    return info
  }
}