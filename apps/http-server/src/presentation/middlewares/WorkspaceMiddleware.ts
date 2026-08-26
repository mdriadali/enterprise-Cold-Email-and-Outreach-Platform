import type { IWorkspaceMemberRepository } from "@repo/ports";
import type { NextFunction, Request, Response } from "express";
import { WorkspaceValidator } from "../../domain/workspace/workspaceValidator";
import { AppError } from "../../domain/AppError";

export interface WorkspaceParams {
    workspaceId: string;
}

export class WorkspaceMiddleware {
    constructor(
        private readonly workspaceMemberRepository: IWorkspaceMemberRepository
    ) { }
    async execute(req: Request, res: Response, next: NextFunction) {
        const userId = req.user.id
        const { workspaceId } = req.params as unknown as WorkspaceParams
        try {
            WorkspaceValidator.validateId(workspaceId ?? null)
            const findWorkspaceMember = await this.workspaceMemberRepository.findByWorkspaceAndUser(workspaceId, userId)
            WorkspaceValidator.validateMemberdata(findWorkspaceMember)
            req.workspaceMember = {
                id: findWorkspaceMember!.id,
                workspaceId: findWorkspaceMember!.workspaceId,
                userId: findWorkspaceMember!.userId,
                role: findWorkspaceMember!.role,
                createdAt: findWorkspaceMember!.createdAt
            }
            return next()
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    messae: error.message
                })
            }
            return res.status(500).json({
                messae: " Internal Server Error"
            })
        }

    }
}
