import { Router } from "express";
import { adminController } from "../container/adminController-dependencies";
import { Auth } from "../container/Middeleware-dependencies";
import { Admin } from "../container/Middeleware-dependencies";

const adminRouter = Router()

adminRouter.use(Auth, Admin)

/**
 * ========================================================================
 * GET /admin/users — List All Users (Paginated)
 * ========================================================================
 *
 * Input:
 *   Query: { page?: number, limit?: number }
 *     - page  → default: 1, min: 1
 *     - limit → default: 10, min: 1, max: 100
 *
 * Output (200):
 *   {
 *     data: [
 *       {
 *         id: string,
 *         name: string,
 *         email: string,
 *         role: "ADMIN" | "USER",
 *         emailVerifiedAt: Date | null,
 *         remainingFreeWorkspaces: number
 *       }
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       totalPages: number
 *     }
 *   }
 *
 * Errors:
 *   400 → { message: "Invalid input" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/users", adminController.getUsers)

/**
 * ========================================================================
 * GET /admin/users/:id — Get User Detail
 * ========================================================================
 *
 * Input:
 *   Params: { id: string }  — target user's ID
 *
 * Output (200):
 *   {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: "ADMIN" | "USER",
 *     emailVerifiedAt: Date | null,
 *     remainingFreeWorkspaces: number,
 *     ownedWorkspacesCount: number,
 *     membershipWorkspacesCount: number,
 *     campaignsCount: number
 *   }
 *
 * Errors:
 *   400 → { message: "Admin target not found" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/users/:id", adminController.getUserDetail)

/**
 * ========================================================================
 * PATCH /admin/users/:id/role — Update User Role
 * ========================================================================
 *
 * Input:
 *   Params: { id: string }          — target user's ID
 *   Body:   { role: "ADMIN" | "USER" }  — new role
 *
 * Output (200):
 *   {
 *     id: string,
 *     name: string,
 *     email: string,
 *     role: "ADMIN" | "USER",
 *     emailVerifiedAt: Date | null,
 *     remainingFreeWorkspaces: number
 *   }
 *
 * Errors:
 *   400 → { message: "Invalid role" }
 *   400 → { message: "Admin cannot modify own role" }
 *   400 → { message: "Admin target not found" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.patch("/users/:id/role", adminController.updateUserRole)

/**
 * ========================================================================
 * DELETE /admin/users/:id — Delete a User
 * ========================================================================
 *
 * Input:
 *   Params: { id: string }  — target user's ID
 *
 * Output (200):
 *   {
 *     success: boolean
 *   }
 *
 * Errors:
 *   400 → { message: "Admin cannot delete own account" }
 *   400 → { message: "Admin target not found" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.delete("/users/:id", adminController.deleteUser)

/**
 * ========================================================================
 * GET /admin/workspaces — List All Workspaces (Paginated)
 * ========================================================================
 *
 * Input:
 *   Query: { page?: number, limit?: number }
 *     - page  → default: 1, min: 1
 *     - limit → default: 10, min: 1, max: 100
 *
 * Output (200):
 *   {
 *     data: [
 *       {
 *         id: string,
 *         name: string,
 *         ownerId: string,
 *         ownerName: string,
 *         ownerEmail: string,
 *         subscription: "STARTER" | "PROFESSIONAL" | "ULTRA",
 *         membersCount: number,
 *         campaignsCount: number,
 *         generationJobsCount: number,
 *         smtpAccountsCount: number,
 *         aiApiKeysCount: number
 *       }
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       totalPages: number
 *     }
 *   }
 *
 * Errors:
 *   400 → { message: "Invalid input" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/workspaces", adminController.listWorkspaces)

/**
 * ========================================================================
 * GET /admin/workspaces/:id — Get Workspace Detail
 * ========================================================================
 *
 * Input:
 *   Params: { id: string }  — target workspace's ID
 *
 * Output (200):
 *   {
 *     id: string,
 *     name: string,
 *     owner: {
 *       id: string,
 *       name: string,
 *       email: string
 *     },
 *     subscription: "STARTER" | "PROFESSIONAL" | "ULTRA",
 *     members: [
 *       {
 *         id: string,
 *         role: "OWNER" | "MEMBER",
 *         userId: string,
 *         userName: string,
 *         userEmail: string
 *       }
 *     ],
 *     campaigns: [
 *       {
 *         id: string,
 *         name: string,
 *         status: "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "QUEUED" | "COMPLETED" | "CANCELLED" | "FAILED",
 *         createdAt: Date
 *       }
 *     ],
 *     _count: {
 *       members: number,
 *       generationJob: number,
 *       AiApiKeys: number,
 *       smtpAccounts: number,
 *       campaign: number
 *     }
 *   }
 *
 * Errors:
 *   400 → { message: "Admin target not found" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/workspaces/:id", adminController.getWorkspaceDetail)

/**
 * ========================================================================
 * GET /admin/campaigns — List All Campaigns (Paginated)
 * ========================================================================
 *
 * Input:
 *   Query: { page?: number, limit?: number }
 *     - page  → default: 1, min: 1
 *     - limit → default: 10, min: 1, max: 100
 *
 * Output (200):
 *   {
 *     data: [
 *       {
 *         id: string,
 *         name: string,
 *         status: "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "QUEUED" | "COMPLETED" | "CANCELLED" | "FAILED",
 *         workspaceId: string,
 *         workspaceName: string,
 *         createdById: string,
 *         createdByName: string,
 *         createdAt: Date,
 *         updatedAt: Date
 *       }
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       totalPages: number
 *     }
 *   }
 *
 * Errors:
 *   400 → { message: "Invalid input" }
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/campaigns", adminController.listCampaigns)

/**
 * ========================================================================
 * GET /admin/stats — Platform-Wide Statistics
 * ========================================================================
 *
 * Input: None
 *
 * Output (200):
 *   {
 *     totalUsers: number,
 *     totalAdmins: number,
 *     totalWorkspaces: number,
 *     totalCampaigns: number,
 *     totalGenerationJobs: number,
 *     totalLeads: number,
 *     totalSmtpAccounts: number,
 *     totalAiApiKeys: number,
 *     totalEmailsSent: number
 *   }
 *
 * Errors:
 *   500 → { message: "Internal Server Error" }
 */
adminRouter.get("/stats", adminController.getStats)

export default adminRouter
