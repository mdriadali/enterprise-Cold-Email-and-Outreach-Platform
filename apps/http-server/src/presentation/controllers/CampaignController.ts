import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";

export class CampaignController {
    constructor(
        private readonly createCampignUseCase: CreateCampignUseCase
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
}