import { prismaClient, Subscription, type Workspace } from "@repo/db";
import type { IWorkspaceRepository } from "@repo/ports";
import type { WorkspaceInfo } from "@repo/types";

export class PrismaWorkspace implements IWorkspaceRepository {
  async create(userId: string, name: string, subscription: Subscription): Promise<Workspace> {
    const createWorkspace = await prismaClient.workspace.create({
      data: {
        name,
        ownerId: userId,
        subscription
      }
    })

    return createWorkspace
  }

  async findById(id: string): Promise<Workspace | null> {
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

  async info(workspaceId: string): Promise<WorkspaceInfo | null> {
    const info = await prismaClient.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        name: true,
        subscription: true,
        ownerId: true,


        _count: {
          select: {
            members: true,
            generationJob: true,
            AiApiKeys: true,
            smtpAccounts: true,
            campaign: true
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
        campaign: {
          take: 10,
          select: {
            id: true,

            workspaceId: true,

            name: true,
            description: true,

            status: true,

            timezone: true,
            startAt: true,
            endAt: true,
            nextRunAt: true,
            dailyLimit: true,
            sendingFromHour: true,
            sendingToHour: true,
            randomDelayMin: true,
            randomDelayMax: true,
            followUpEnabled: true,
            stopOnReply: true,
            stopOnBounce: true,
            createdById: true,
            createdBy: true,
            smtpAccountId: true,
            error: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
    });

    if (!info) {
      return null
    }

    return info
  }
}
