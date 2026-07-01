import type { aiApiStatus, AiProvider, GenerationJobStatus, WorkspaceMemberRole } from "@repo/db"
import type { GenerationJobData } from "./generationJob-types"
import type { aiApiData } from "./aiApi-types"

export interface workspaceData {
    id: string,
    name: string,
    ownerId: string,
}

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




export interface workspaceInfoData {
  id: string;
  name: string;

  _count: {
    members: number;
    generationJob: number;
    AiApiKeys: number;
  };

  members: {
    id: string;
    role: WorkspaceMemberRole;

    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];

  generationJob: {
    id: string;
    name: string;
    status: GenerationJobStatus;

    totalLeads: number |null;
    successCount: number | null;
    failedCount: number | null;
    pendingCount: number | null;

    createdAt: Date;
  }[];

  AiApiKeys: {
    id: string;
    aiProvider: AiProvider;
    status: aiApiStatus;

  }[];
}