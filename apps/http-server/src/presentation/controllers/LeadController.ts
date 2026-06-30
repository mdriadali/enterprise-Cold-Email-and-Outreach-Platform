import type { Request, Response } from "express"
import { AppError } from "../../domain/AppError"
import type { CreateLeadUseCase } from "../../application/use-cases/lead/createLead-useCase"
import type { CreateBulkLeadUseCase } from "../../application/use-cases/lead/createBulkLeadUseCase"

export class LeadController {
    constructor(
        private readonly createLeadUseCase: CreateLeadUseCase,
        private readonly createBulkLeadUseCase: CreateBulkLeadUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            console.log("[Lead create] Request Recived")
            const userid = req.user.id
            const { leadData } = req.body
            const { generationJobId } = req.params
            console.log("genId", generationJobId)
            const lead = await this.createLeadUseCase.execute(userid, generationJobId as string, leadData)
            console.log("[Lead create] Sucessfully")
            return res.status(200).json({
                lead
            })

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }

            console.log("[Lead create] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }

    bulkCreate = async (req: Request, res: Response) => {
        try {
            console.log("[Lead Bulk Create] Request Received");

            const userId = req.user.id;

            const { leads } = req.body;
            const { generationJobId } = req.params
            const createdLeads = await this.createBulkLeadUseCase.execute(
                userId,
                generationJobId as string,
                leads
            );

            console.log(
                "[Lead Bulk Create] Successfully"
            );

            return res.status(200).json({
                count: createdLeads
            });

        } catch (error) {

            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[Lead Bulk Create] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    };
}