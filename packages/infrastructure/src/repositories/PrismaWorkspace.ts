import type { workspaceData, workspaceInfoData } from "@repo/types";
import { prismaClient } from "@repo/db";
import type { IWorkspaceRepository } from "@repo/ports";

export class PrismaWorkspace implements IWorkspaceRepository {
  async create(userId: string, name: string): Promise<workspaceData> {
    const createWorkspace = await prismaClient.workspace.create({
      data: {
        name,
        ownerId: userId
      }
    })

    return {
      id: createWorkspace.id,
      name: createWorkspace.name,
      ownerId: createWorkspace.ownerId
    }
  }

  async findById(id: string): Promise<workspaceData | null> {
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

  async info(workspaceId: string): Promise<workspaceInfoData | null> {
      const info=await prismaClient.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,

        _count: {
          select: {
            members: true,
            generationJob: true,
            AiApiKeys: true,
            // smtpAccounts: true,
            // campaigns: true,
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
                subscription:true
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