import type { Request, Response } from "express"
import { AppError } from "../../domain/AppError"
import type { CreateAiAPiUseCase } from "../../application/use-cases/aiApi/createAiApi-useCase"
import type { FindAiAPIUseCase } from "../../application/use-cases/aiApi/findAiApi-useCase"
import type { UpdateAiApiUseCase } from "../../application/use-cases/aiApi/updateAiApi-useCase"
import type { DeleteAiApiUseCase } from "../../application/use-cases/aiApi/deleteAiApi-useCase"


export class AiApiController {
    constructor(
        private readonly createAiAPiUseCase: CreateAiAPiUseCase,
        private readonly findAiAPIUseCase: FindAiAPIUseCase,
        private readonly updateAiApiUseCase: UpdateAiApiUseCase,
        private readonly deleteAiApiUseCase: DeleteAiApiUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id
            const { provider, key } = req.body
            const workspaceId = req.workspaceMember!.workspaceId
            const newApi = await this.createAiAPiUseCase.execute(userId, workspaceId, provider, key)
            return res.status(200).json({
                apiData: newApi
            })

        } catch (error) {
            if (error instanceof AppError) {
                res.status(400).json({
                    massae: error.message
                })
            }

            res.status(500).json({
                massage: "Internal Server Error"
            })
        }
    }
    find = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember!.workspaceId


        try {
            const result = await this.findAiAPIUseCase.execute(workspaceId)
            return res.status(200).json(result)

        } catch (error) {
            if (error instanceof AppError) {
                res.status(400).json({
                    massae: error.message
                })
            }

            res.status(500).json({
                massage: "Internal Server Error"
            })
        }
    }
    update = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember!.workspaceId
        const { id } = req.params
        const userId = req.user.id
        const { provider, key } = req.body
        try {
            const updated = await this.updateAiApiUseCase.execute(workspaceId, id as string, userId, provider, key)
            return res.status(200).json({
                apiData: updated
            })
        } catch (error) {
            if (error instanceof AppError) {
                res.status(400).json({
                    massae: error.message
                })
            }

            res.status(500).json({
                massage: "Internal Server Error"
            })
        }
    }
    delete = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember!.workspaceId
        const { id } = req.params
        const userId = req.user.id
        try {
            const removed = await this.deleteAiApiUseCase.execute(workspaceId, id as string, userId)
            return res.status(200).json({
                apiData: removed
            })
        } catch (error) {
            if (error instanceof AppError) {
                res.status(400).json({
                    massae: error.message
                })
            }

            res.status(500).json({
                massage: "Internal Server Error"
            })
        }
    }
}
