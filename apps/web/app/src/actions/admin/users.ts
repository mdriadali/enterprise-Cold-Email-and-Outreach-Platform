"use server";

import { z } from "zod";
import { callApi } from "../auth/api-client";

const adminUserRoleSchema = z.enum(["ADMIN", "USER"]);

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  emailVerifiedAt: Date | null;
  remainingFreeWorkspaces: number;
}

export interface AdminUsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminUsersResult =
  | { status: "success"; data: AdminUserResponse[]; pagination: AdminUsersPagination }
  | { status: "error"; message: string };

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function listAdminUsers(options: {
  page?: number;
  limit?: number;
} = {}): Promise<AdminUsersResult> {
  try {
    const parsed = listUsersQuerySchema.parse(options);

    const result = await callApi({
      method: "GET",
      url: `admin/users?page=${parsed.page}&limit=${parsed.limit}`,
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    const body = result.data as Record<string, unknown>;
    const rawUsers = body.data as unknown[];
    const pagination = body.pagination as { page: number; limit: number; total: number; totalPages: number };

    if (!Array.isArray(rawUsers) || !pagination) {
      return { status: "error", message: "Unexpected response from server." };
    }

    const data: AdminUserResponse[] = rawUsers.map((u) => {
      const user = u as Record<string, unknown>;
      return {
        id: user.id as string,
        name: user.name as string,
        email: user.email as string,
        role: user.role as "ADMIN" | "USER",
        emailVerifiedAt: user.emailVerifiedAt ? new Date(user.emailVerifiedAt as string) : null,
        remainingFreeWorkspaces: user.remainingFreeWorkspaces as number,
      };
    });

    return {
      status: "success",
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    };
  } catch {
    return { status: "error", message: "Invalid input" };
  }
}

export interface AdminUserDetailData {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  emailVerifiedAt: Date | null;
  remainingFreeWorkspaces: number;
  ownedWorkspacesCount: number;
  membershipWorkspacesCount: number;
  campaignsCount: number;
}

export type AdminUserDetailResult =
  | { status: "success"; data: AdminUserDetailData }
  | { status: "error"; message: string };

export async function getUserAdminDetail(
  userId: string
): Promise<AdminUserDetailResult> {
  try {
    if (!userId || typeof userId !== "string") {
      return { status: "error", message: "Invalid user ID." };
    }

    const result = await callApi({
      method: "GET",
      url: `admin/users/${encodeURIComponent(userId)}`,
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    const user = result.data as Record<string, unknown>;

    if (!user || typeof user.id !== "string") {
      return { status: "error", message: "User not found." };
    }

    const data: AdminUserDetailData = {
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as "ADMIN" | "USER",
      emailVerifiedAt: user.emailVerifiedAt
        ? new Date(user.emailVerifiedAt as string)
        : null,
      remainingFreeWorkspaces: user.remainingFreeWorkspaces as number,
      ownedWorkspacesCount: user.ownedWorkspacesCount as number,
      membershipWorkspacesCount: user.membershipWorkspacesCount as number,
      campaignsCount: user.campaignsCount as number,
    };

    return { status: "success", data };
  } catch {
    return { status: "error", message: "Could not load user details." };
  }
}

export interface AdminUpdateRoleResult {
  status: "success" | "error";
  message: string;
}

export async function updateUserAdminRole(
  userId: string,
  role: "ADMIN" | "USER"
): Promise<AdminUpdateRoleResult> {
  try {
    if (!userId || typeof userId !== "string") {
      return { status: "error", message: "Invalid user ID." };
    }

    const parsed = adminUserRoleSchema.parse(role);

    const result = await callApi({
      method: "PATCH",
      url: `admin/users/${encodeURIComponent(userId)}/role`,
      data: { role: parsed },
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    return { status: "success", message: "Role updated successfully." };
  } catch {
    return { status: "error", message: "Invalid input" };
  }
}

export async function deleteUserAdmin(
  userId: string
): Promise<AdminUpdateRoleResult> {
  try {
    if (!userId || typeof userId !== "string") {
      return { status: "error", message: "Invalid user ID." };
    }

    const result = await callApi({
      method: "DELETE",
      url: `admin/users/${encodeURIComponent(userId)}`,
    });

    if (result.status === "error") {
      return { status: "error", message: result.message };
    }

    return { status: "success", message: "User deleted successfully." };
  } catch {
    return { status: "error", message: "Could not delete user." };
  }
}
