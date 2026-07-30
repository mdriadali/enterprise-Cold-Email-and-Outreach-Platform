import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import type { UpdateCampaignStatusUseCase } from "../../application/use-cases/campaign/updateCampaignStatus-useCase";
import type { UpdateCampaignUseCase } from "../../application/use-cases/campaign/updateCampaign-useCase";
import type { DeleteCampaignUseCase } from "../../application/use-cases/campaign/deleteCampaign-useCase";
import type { FindCampaignuseCase } from "../../application/use-cases/campaign/findCampaign-useCase";

export class CampaignController {
    constructor(
        private readonly createCampignUseCase: CreateCampignUseCase,
        private readonly findCampaignuseCase:FindCampaignuseCase,
        private readonly updateCampaignStatusUseCase: UpdateCampaignStatusUseCase,
        private readonly updateCampaignUseCase: UpdateCampaignUseCase,
        private readonly deleteCampaignUseCase: DeleteCampaignUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        console.log("[Create Campaign] Request Recived")

        const workspaceId = req.workspaceMember?.workspaceId as string
        const createdById = req.workspaceMember?.userId as string

        const { name, description, timezone, startAt, endAt, dailyLimit, sendingFromHour, sendingToHour, randomDelayMin, followUpEnabled, stopOnReply, stopOnBounce, smtpAccountId, generationJobId, emails, } = req.body

        try {

            const campaign = await this.createCampignUseCase.execute({ workspaceId, name, description, timezone, startAt, endAt, dailyLimit, sendingFromHour, sendingToHour, randomDelayMin, followUpEnabled, stopOnReply, stopOnBounce, createdById, smtpAccountId, generationJobId, emails, })

            console.log("[Create Campaign]  Sucessfully")
            return res.status(200).json(campaign)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Create Campaign] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    find=async (req: Request, res: Response) => {
        console.log("[Create Campaign] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const {id}=req.params
        try {
            const campaign=await this.findCampaignuseCase.execute(id as string,workspaceId)
            return res.status(200).json(campaign)
        } catch (error) {
             if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Find Campaign] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    updateStatus = async (req: Request, res: Response) => {
        console.log("[Update Campaign status] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { id } = req.params
        const { status } = req.body
        try {
            const update = await this.updateCampaignStatusUseCase.execute(workspaceId, id as string, status)
            res.status(200).json(update)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Update Campaign status] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
    update = async (req: Request, res: Response) => {
        console.log("[Update Campaign] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { id } = req.params
        const { data } = req.body

        try {

            const upadte = await this.updateCampaignUseCase.execute(workspaceId, id as string, data)

            console.log("[Update Campaign] sucessfully")
            return res.status(200).json(upadte)

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Update Campaign] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }

    delete = async (req: Request, res: Response) => {
        console.log("[Delete Campaign] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { id } = req.params
        const userId = req.user.id
        try {
            const deleteCampaign = await this.deleteCampaignUseCase.execute(id as string, workspaceId, userId)
            return res.status(200).json(deleteCampaign)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Delete Campaign] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}