import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import type { StartGenerationJobUseCase } from "../../application/use-cases/generationJob/startGenerationJob-usecase";
import type { GetGenerationJobUseCase } from "../../application/use-cases/generationJob/getGenerationJob-useCase";

export class GenerationJobController {
    constructor(
        private readonly creategenerationJobUseCase: CreategenerationJobUseCase,
        private readonly startGenerationJobUseCase: StartGenerationJobUseCase,
        private readonly getGenerationJobUseCase: GetGenerationJobUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            console.log("[GenerationJob Create] Request Recived ")
            const userid = req.user.id
            const workspaceId = req.workspaceMember!.workspaceId
            const { name } = req.body
            const generationJob = await this.creategenerationJobUseCase.execute(userid, workspaceId, name)
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
    get = async (req: Request, res: Response) => {
        try {
            console.log("[GenerationJob Get] Request Recived")
            const generatioJobId = req.params.generationJobId
            const workspaceId = req.workspaceMember?.workspaceId
            const job = await this.getGenerationJobUseCase.execute(workspaceId as string, generatioJobId as string)
            console.log("[GenerationJob Get] Data Send Sucessfully")
            return res.status(200).json(job)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[GenerationJob Get] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    start = async (req: Request, res: Response) => {
        try {
            console.log("[GenerationJob Start] Request Recived")

            const workspaceId = req.workspaceMember?.workspaceId
            const { jobid } = req.params;
            const start = await this.startGenerationJobUseCase.execute(workspaceId as string, jobid as string)

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