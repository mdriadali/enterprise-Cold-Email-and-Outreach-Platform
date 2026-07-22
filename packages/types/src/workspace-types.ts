import type { aiApiStatus, AiProvider, GenerationJobStatus, Subscription, WorkspaceMemberRole } from "@repo/db"



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
