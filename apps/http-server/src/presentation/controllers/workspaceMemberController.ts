import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { AddMemberUseCase } from "../../application/use-cases/workspace/addMember-useCase";

export class WorkspaceMemberController {
    constructor(
        private readonly addMemberUseCase: AddMemberUseCase
    ) { }
    add = async (req: Request, res: Response,) => {
        console.log("[Add workspace member] Request Recived")
        const workspaceId = req.workspaceMember!.workspaceId
        const { email, role } = req.body
        const userId = req.user.id

        try {
            const add = await this.addMemberUseCase.execute(workspaceId, userId, email, role)
            console.log("[Add workspace member] Sucessfully")
            return res.status(200).json(add)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Add workspace member] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}