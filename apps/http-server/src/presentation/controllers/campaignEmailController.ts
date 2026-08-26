import type { Request, Response } from "express";
import { AppError } from "../../domain/AppError";
import type { AllCampaignEmailUseCase } from "../../application/use-cases/campaignEmail/allCampaignEmail-useCase";

export class CampaignEmailController {
    constructor(
        private readonly allCampaignEmailUseCase: AllCampaignEmailUseCase
    ) { }
    all = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember.workspaceId
        const { campaignId } = req.params

        try {
            const emails = await this.allCampaignEmailUseCase.execute(campaignId as string, workspaceId)
            return res.status(200).json(emails)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
}
