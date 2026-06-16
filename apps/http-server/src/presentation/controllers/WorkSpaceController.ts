import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/createworkspace-useCase";

export class WorkspaceController {
    constructor(
        private readonly createWorkspaceUseCase: CreateWorkspaceUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        console.log("[workspace create] Rquest Recived ")
        try {
            const userId = req.user.id
            const {name} = req.body
            const createworkspace = await this.createWorkspaceUseCase.execute(userId, name)
            console.log("[workspce create] created sucessfully ")
            return res.status(200).json({
                createworkspace
            })
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }
            console.log("[workspace create] Internal Server Error",error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}