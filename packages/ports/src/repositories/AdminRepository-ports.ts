import type {
  AdminCampaignResponse,
  AdminStatsResponse,
  AdminUserDetailResponse,
  AdminUserResponse,
  AdminWorkspaceDetailResponse,
  AdminWorkspaceResponse,
} from "@repo/types";

export interface IAdminRepository {
  listUsers(page: number, limit: number): Promise<{ data: AdminUserResponse[]; total: number }>;
  getUserDetail(userId: string): Promise<AdminUserDetailResponse | null>;
  updateUserRole(userId: string, role: "ADMIN" | "USER"): Promise<AdminUserResponse | null>;
  deleteUser(userId: string): Promise<boolean>;
  listWorkspaces(page: number, limit: number): Promise<{ data: AdminWorkspaceResponse[]; total: number }>;
  getWorkspaceDetail(workspaceId: string): Promise<AdminWorkspaceDetailResponse | null>;
  listCampaigns(page: number, limit: number): Promise<{ data: AdminCampaignResponse[]; total: number }>;
  getStats(): Promise<AdminStatsResponse>;
}
