import { CampaignStatus, WorkspaceMemberRole, type AiApi, type aiApiStatus, type AiProvider, type GenerationJob, type GenerationJobStatus, type Subscription, type Workspace, type WorkspaceMember } from "@repo/db"



export interface workspaceMemberCreateData {
  workspaceId: string,
  memberId: string,
  role: WorkspaceMemberRole
}

export interface workspaceMemberData {
  id: string,
  workspaceId: string,
  userId: string,
  role: WorkspaceMemberRole,
  createdAt: Date
}


export type WorkspaceInfo = {
  name: string;
  id: string;
  ownerId: string;
  subscription: Subscription;
  members: {
    id: string;
    role: WorkspaceMemberRole;
    user: {
      name: string;
      id: string;
      email: string;
    };
  }[];
  generationJob: {
    name: string;
    id: string;
    createdAt: Date;
    status: GenerationJobStatus;
    totalLeads: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  }[];
  AiApiKeys: {
    id: string;
    status: aiApiStatus;
    aiProvider: AiProvider;
  }[];
  _count: {
    members: number;
    generationJob: number;
    AiApiKeys: number;
    smtpAccounts: number;
    campaign: number;
  };
  campaign: {
    id: string

    workspaceId: string

    name: string
    description?: string |null

    status: CampaignStatus

    // Scheduling
    timezone: string
    startAt?: Date | null
    endAt?: Date | null
    nextRunAt?: Date | null

    // Sending Rules
    dailyLimit: number
    sendingFromHour: number | null
    sendingToHour: number | null

    randomDelayMin: number | null
    randomDelayMax: number | null

    // Options
    followUpEnabled: boolean
    stopOnReply: boolean
    stopOnBounce: boolean

    createdById: string

    smtpAccountId: string

    error?: string | null

    createdAt: Date
    updatedAt: Date

  }[]
} | null
