import type { Request, Response } from "express"
import { AppError } from "../../domain/AppError"
import type { CreateAiAPiUseCase } from "../../application/use-cases/aiApi/createAiApi-useCase"


export class AiApiController {
    constructor(
        private readonly createAiAPiUseCase:CreateAiAPiUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            console.log("[aiApi create] Request Recived")
            const userId=req.user.id
            const {provider, key}=req.body
            const newApi=await this.createAiAPiUseCase.execute(userId,provider,key)
            console.log("[aiApi create] sucessfully")
            return res.status(200).json({
                apiData:newApi
            })

        } catch (error) {
            if (error instanceof AppError) {
                res.status(400).json({
                    massae: error.message
                })
            }

            console.log("[aiApi create] Internal Server Error",error)
            res.status(500).json({
                massage:"Internal Server Error"
            })
        }
    }
}