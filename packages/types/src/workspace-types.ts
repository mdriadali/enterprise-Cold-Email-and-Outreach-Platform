import type { WorkspaceMemberRole } from "@repo/db"

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
    userId:string,
    role:WorkspaceMemberRole,
    createdAt:Date
}