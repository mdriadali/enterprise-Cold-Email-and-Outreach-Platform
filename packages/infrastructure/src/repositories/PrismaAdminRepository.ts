import { prismaClient } from "@repo/db";
import type {
  AdminCampaignResponse,
  AdminStatsResponse,
  AdminUserDetailResponse,
  AdminUserResponse,
  AdminWorkspaceDetailResponse,
  AdminWorkspaceResponse,
} from "@repo/types";
import type { IAdminRepository } from "@repo/ports";

export class PrismaAdminRepository implements IAdminRepository {
  async listUsers(page: number, limit: number): Promise<{ data: AdminUserResponse[]; total: number }> {
    const total = await prismaClient.user.count();
    const users = await prismaClient.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { email: "asc" },
    });

    const data: AdminUserResponse[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerifiedAt: u.emailVerifiedAt,
      remainingFreeWorkspaces: u.remainingFreeWorkspaces,
    }));

    return { data, total };
  }

  async getUserDetail(userId: string): Promise<AdminUserDetailResponse | null> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            ownedWorkspaces: true,
            workspaceMemberships: true,
            campaign: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      remainingFreeWorkspaces: user.remainingFreeWorkspaces,
      ownedWorkspacesCount: user._count.ownedWorkspaces,
      membershipWorkspacesCount: user._count.workspaceMemberships,
      campaignsCount: user._count.campaign,
    };
  }

  async updateUserRole(
    userId: string,
    role: "ADMIN" | "USER"
  ): Promise<AdminUserResponse | null> {
    const updated = await prismaClient.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      emailVerifiedAt: updated.emailVerifiedAt,
      remainingFreeWorkspaces: updated.remainingFreeWorkspaces,
    };
  }

  async deleteUser(userId: string): Promise<boolean> {
    await prismaClient.user.delete({
      where: { id: userId },
    });
    return true;
  }

  async listWorkspaces(page: number, limit: number): Promise<{ data: AdminWorkspaceResponse[]; total: number }> {
    const total = await prismaClient.workspace.count();
    const workspaces = await prismaClient.workspace.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            members: true,
            campaign: true,
            generationJob: true,
            smtpAccounts: true,
            AiApiKeys: true,
          },
        },
      },
    });

    const data: AdminWorkspaceResponse[] = workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      ownerId: w.ownerId,
      ownerName: w.owner.name,
      ownerEmail: w.owner.email,
      subscription: w.subscription,
      membersCount: w._count.members,
      campaignsCount: w._count.campaign,
      generationJobsCount: w._count.generationJob,
      smtpAccountsCount: w._count.smtpAccounts,
      aiApiKeysCount: w._count.AiApiKeys,
    }));

    return { data, total };
  }

  async getWorkspaceDetail(workspaceId: string): Promise<AdminWorkspaceDetailResponse | null> {
    const workspace = await prismaClient.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            members: true,
            generationJob: true,
            AiApiKeys: true,
            smtpAccounts: true,
            campaign: true,
          },
        },
      },
    });

    if (!workspace) {
      return null;
    }

    return {
      id: workspace.id,
      name: workspace.name,
      owner: workspace.owner,
      subscription: workspace.subscription,
      members: workspace.members.map((m) => ({
        id: m.id,
        role: m.role,
        userId: m.userId,
        userName: m.user.name,
        userEmail: m.user.email,
      })),
      campaigns: workspace.campaign,
      _count: workspace._count,
    };
  }

  async listCampaigns(page: number, limit: number): Promise<{ data: AdminCampaignResponse[]; total: number }> {
    const total = await prismaClient.campaign.count();
    const campaigns = await prismaClient.campaign.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        workspace: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    const data: AdminCampaignResponse[] = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      workspaceId: c.workspaceId,
      workspaceName: c.workspace.name,
      createdById: c.createdById,
      createdByName: c.createdBy.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return { data, total };
  }

  async getStats(): Promise<AdminStatsResponse> {
    const [
      totalUsers,
      totalAdmins,
      totalWorkspaces,
      totalCampaigns,
      totalGenerationJobs,
      totalLeads,
      totalSmtpAccounts,
      totalAiApiKeys,
      totalEmailsSent,
    ] = await Promise.all([
      prismaClient.user.count(),
      prismaClient.user.count({ where: { role: "ADMIN" } }),
      prismaClient.workspace.count(),
      prismaClient.campaign.count(),
      prismaClient.generationJob.count(),
      prismaClient.lead.count(),
      prismaClient.smtpAccount.count(),
      prismaClient.aiApi.count(),
      prismaClient.campaignEmail.count({ where: { status: "SENT" } }),
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalWorkspaces,
      totalCampaigns,
      totalGenerationJobs,
      totalLeads,
      totalSmtpAccounts,
      totalAiApiKeys,
      totalEmailsSent,
    };
  }
}
