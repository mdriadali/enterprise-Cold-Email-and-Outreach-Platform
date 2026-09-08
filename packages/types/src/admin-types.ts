import type {
  CampaignStatus,
  Role,
  Subscription,
  WorkspaceMemberRole,
} from "./enums";

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerifiedAt: Date | null;
  remainingFreeWorkspaces: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserDetailResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerifiedAt: Date | null;
  remainingFreeWorkspaces: number;
  ownedWorkspacesCount: number;
  membershipWorkspacesCount: number;
  campaignsCount: number;
}

export interface AdminWorkspaceResponse {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  subscription: Subscription;
  membersCount: number;
  campaignsCount: number;
  generationJobsCount: number;
  smtpAccountsCount: number;
  aiApiKeysCount: number;
}

export interface AdminWorkspaceDetailResponse {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  subscription: Subscription;
  members: {
    id: string;
    role: WorkspaceMemberRole;
    userId: string;
    userName: string;
    userEmail: string;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: CampaignStatus;
    createdAt: Date;
  }[];
  _count: {
    members: number;
    generationJob: number;
    AiApiKeys: number;
    smtpAccounts: number;
    campaign: number;
  };
}

export interface AdminCampaignResponse {
  id: string;
  name: string;
  status: CampaignStatus;
  workspaceId: string;
  workspaceName: string;
  createdById: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalAdmins: number;
  totalWorkspaces: number;
  totalCampaigns: number;
  totalGenerationJobs: number;
  totalLeads: number;
  totalSmtpAccounts: number;
  totalAiApiKeys: number;
  totalEmailsSent: number;
}

export interface AdminUpdateUserRoleInput {
  role: Role;
}
