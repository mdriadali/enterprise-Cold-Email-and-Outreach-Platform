import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import { AdminValidator } from "../../domain/admin/AdminValidator";
import type { AdminGetUsersUseCase } from "../../application/use-cases/admin/AdminGetUsersUseCase";
import type { AdminGetUserDetailUseCase } from "../../application/use-cases/admin/AdminGetUserDetailUseCase";
import type { AdminUpdateUserRoleUseCase } from "../../application/use-cases/admin/AdminUpdateUserRoleUseCase";
import type { AdminDeleteUserUseCase } from "../../application/use-cases/admin/AdminDeleteUserUseCase";
import type { AdminListWorkspacesUseCase } from "../../application/use-cases/admin/AdminListWorkspacesUseCase";
import type { AdminGetWorkspaceDetailUseCase } from "../../application/use-cases/admin/AdminGetWorkspaceDetailUseCase";
import type { AdminListCampaignsUseCase } from "../../application/use-cases/admin/AdminListCampaignsUseCase";
import type { AdminGetStatsUseCase } from "../../application/use-cases/admin/AdminGetStatsUseCase";

export class AdminController {
    constructor(
        private readonly getUsersUseCase: AdminGetUsersUseCase,
        private readonly getUserDetailUseCase: AdminGetUserDetailUseCase,
        private readonly updateUserRoleUseCase: AdminUpdateUserRoleUseCase,
        private readonly deleteUserUseCase: AdminDeleteUserUseCase,
        private readonly listWorkspacesUseCase: AdminListWorkspacesUseCase,
        private readonly getWorkspaceDetailUseCase: AdminGetWorkspaceDetailUseCase,
        private readonly listCampaignsUseCase: AdminListCampaignsUseCase,
        private readonly getStatsUseCase: AdminGetStatsUseCase
    ) { }

    getUsers = async (req: Request, res: Response) => {
        try {
            const { page, limit } = AdminValidator.resolvePagination(req.query.page, req.query.limit);
            const result = await this.getUsersUseCase.execute(page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    getUserDetail = async (req: Request, res: Response) => {
        try {
            const userId = req.params.id as string;
            const result = await this.getUserDetailUseCase.execute(userId);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    updateUserRole = async (req: Request, res: Response) => {
        try {
            const actorId = req.user.id;
            const userId = req.params.id as string;
            const role = AdminValidator.validateRole(req.body.role);
            const result = await this.updateUserRoleUseCase.execute(actorId, userId, role);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    deleteUser = async (req: Request, res: Response) => {
        try {
            const actorId = req.user.id;
            const userId = req.params.id as string;
            const deleted = await this.deleteUserUseCase.execute(actorId, userId);
            return res.status(200).json({ success: deleted });
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    listWorkspaces = async (req: Request, res: Response) => {
        try {
            const { page, limit } = AdminValidator.resolvePagination(req.query.page, req.query.limit);
            const result = await this.listWorkspacesUseCase.execute(page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    getWorkspaceDetail = async (req: Request, res: Response) => {
        try {
            const workspaceId = req.params.id as string;
            const result = await this.getWorkspaceDetailUseCase.execute(workspaceId);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    listCampaigns = async (req: Request, res: Response) => {
        try {
            const { page, limit } = AdminValidator.resolvePagination(req.query.page, req.query.limit);
            const result = await this.listCampaignsUseCase.execute(page, limit);
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    getStats = async (req: Request, res: Response) => {
        try {
            const result = await this.getStatsUseCase.execute();
            return res.status(200).json(result);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    private handleError(error: unknown, res: Response): Response {
        if (error instanceof AppError) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
