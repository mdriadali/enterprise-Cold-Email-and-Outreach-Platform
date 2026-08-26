import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import type { StartGenerationJobUseCase } from "../../application/use-cases/generationJob/startGenerationJob-usecase";
import type { GetGenerationJobUseCase } from "../../application/use-cases/generationJob/getGenerationJob-useCase";
import type { FindGenerationJobsUseCase } from "../../application/use-cases/generationJob/findGenerationJobs-useCase";
import type { UpdateGenerationJobUseCase } from "../../application/use-cases/generationJob/updateGenerationJob-useCase";
import type { DeleteGenerationJobUseCase } from "../../application/use-cases/generationJob/deleteGenerationJob-useCase";

export class GenerationJobController {
    constructor(
        private readonly creategenerationJobUseCase: CreategenerationJobUseCase,
        private readonly startGenerationJobUseCase: StartGenerationJobUseCase,
        private readonly getGenerationJobUseCase: GetGenerationJobUseCase,
        private readonly findGenerationJobsUseCase: FindGenerationJobsUseCase,
        private readonly updateGenerationJobUseCase: UpdateGenerationJobUseCase,
        private readonly deleteGenerationJobUseCase: DeleteGenerationJobUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            const userid = req.user.id
            const workspaceId = req.workspaceMember!.workspaceId
            const { name } = req.body
            const generationJob = await this.creategenerationJobUseCase.execute(userid, workspaceId, name)
            return res.status(200).json({
                generationJob
            })
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
    get = async (req: Request, res: Response) => {
        try {
            const generatioJobId = req.params.generationJobId
            const workspaceId = req.workspaceMember?.workspaceId
            const job = await this.getGenerationJobUseCase.execute(workspaceId as string, generatioJobId as string)
            return res.status(200).json(job)
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
    start = async (req: Request, res: Response) => {
        try {

            const workspaceId = req.workspaceMember?.workspaceId
            const { jobid } = req.params;
            const start = await this.startGenerationJobUseCase.execute(workspaceId as string, jobid as string)

            return res.status(200)
                .json({ sucess: true, message: "Genaration Start JobId:", jobid })

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
    find = async (req: Request, res: Response) => {
        try {
            const workspaceId = req.workspaceMember?.workspaceId
            const page = Number(req.query.page ?? 1)
            const jobs = await this.findGenerationJobsUseCase.execute(workspaceId as string, page)
            return res.status(200).json(jobs)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({ message: error.message })
            }
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }
    update = async (req: Request, res: Response) => {
        try {
            const workspaceId = req.workspaceMember?.workspaceId
            const { generationJobId } = req.params
            const { name } = req.body
            const job = await this.updateGenerationJobUseCase.execute(workspaceId as string, generationJobId as string, name)
            return res.status(200).json({ job })
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({ message: error.message })
            }
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }
    delete = async (req: Request, res: Response) => {
        try {
            const workspaceId = req.workspaceMember?.workspaceId
            const userId = req.user.id
            const { generationJobId } = req.params
            const job = await this.deleteGenerationJobUseCase.execute(workspaceId as string, generationJobId as string, userId)
            return res.status(200).json({ job })
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({ message: error.message })
            }
            return res.status(500).json({ message: "Internal Server Error" })
        }
    }

     
}
