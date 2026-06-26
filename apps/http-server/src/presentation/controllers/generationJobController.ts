import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import type { StartGenerationJobUseCase } from "../../application/use-cases/generationJob/startGenerationJob-usecase";

export class GenerationJobController {
    constructor(
        private readonly creategenerationJobUseCase: CreategenerationJobUseCase,
        private readonly startGenerationJobUseCase: StartGenerationJobUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            console.log("[GenerationJob Create] Request Recived ")
            const userid = req.user.id
            const { workspaceId } = req.body
            const generationJob = await this.creategenerationJobUseCase.execute(userid, workspaceId)
            console.log("[GenerationJob Create] Sucessfully")
            return res.status(200).json({
                generationJob
            })
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[GenerationJob Create] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    start = async (req: Request, res: Response) => {
        try {
            console.log("[GenerationJob Start] Request Recived")

            const userId = req.user.id
           const { jobid } = req.params;
            const start = await this.startGenerationJobUseCase.execute(userId, jobid as string)

            console.log("[GenerationJob Start] Sucessfully JobId:", jobid)

            return res.status(200)
            .json({ sucess: true, message: "Genaration Start JobId:", jobid })

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[GenerationJob Start] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}