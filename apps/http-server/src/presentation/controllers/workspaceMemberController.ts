import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { AddMemberUseCase } from "../../application/use-cases/workspace/addMember-useCase";
import type { DeleteMemberUseCase } from "../../application/use-cases/workspace/deleteMember-useCase";

export class WorkspaceMemberController {
    constructor(
        private readonly addMemberUseCase: AddMemberUseCase,
        private readonly deleteMemberUseCase: DeleteMemberUseCase
    ) { }
    add = async (req: Request, res: Response,) => {
        const workspaceId = req.workspaceMember!.workspaceId
        const { email, role } = req.body
        const userId = req.user.id

        try {
            const add = await this.addMemberUseCase.execute(workspaceId, userId, email, role)
            return res.status(200).json(add)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    delete = async (req: Request, res: Response,) => {
        const workspaceId = req.workspaceMember!.workspaceId
        const { memberId } = req.params
        const userId = req.user.id

        try {
            const remove = await this.deleteMemberUseCase.execute(workspaceId, memberId as string, userId)
            return res.status(200).json(remove)

        } catch (error) {

            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}
