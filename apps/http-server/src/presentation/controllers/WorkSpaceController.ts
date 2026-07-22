import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreateWorkspaceUseCase } from "../../application/use-cases/workspace/createworkspace-useCase";
import type { GetWorkspaceInfoUseCase } from "../../application/use-cases/workspace/getworkspaceinfo-usecase";

export class WorkspaceController {
    constructor(
        private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
        private readonly getWorkspaceInfoUseCase:GetWorkspaceInfoUseCase

    ) { }
    create = async (req: Request, res: Response) => {
        console.log("[workspace create] Request Recived ")
        try {
            const userId = req.user.id
            const {name,subscription} = req.body
            const createworkspace = await this.createWorkspaceUseCase.execute(userId, name,subscription)
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

    info=async(req: Request, res: Response)=>{
        try {
            console.log("[workspace Info] Request Recived ")
            const workspaceId=req.workspaceMember!.workspaceId
           const info= await this.getWorkspaceInfoUseCase.execute(workspaceId)
           console.log("[workspace info] data send sucessfully")
           return res.status(200).json(info)
        } catch (error) {
              if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }
            console.log("[workspace info] Internal Server Error",error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}