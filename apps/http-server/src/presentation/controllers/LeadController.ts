import type { Request, Response } from "express"
import { AppError } from "../../domain/AppError"
import type { CreateLeadUseCase } from "../../application/use-cases/lead/createLead-useCase"
import type { CreateBulkLeadUseCase } from "../../application/use-cases/lead/createBulkLeadUseCase"
import type { AllLeadFindUseCase } from "../../application/use-cases/lead/allLeadFind-UseCase"

export class LeadController {
    constructor(
        private readonly createLeadUseCase: CreateLeadUseCase,
        private readonly createBulkLeadUseCase: CreateBulkLeadUseCase,
        private readonly allLeadFindUseCase: AllLeadFindUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        try {
            const userid = req.user.id
            const { leadData } = req.body
            const { generationJobId } = req.params
            const lead = await this.createLeadUseCase.execute(userid, generationJobId as string, leadData)
            return res.status(200).json({
                lead
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

    bulkCreate = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id;

            const { leads } = req.body;
            const { generationJobId } = req.params
            const createdLeads = await this.createBulkLeadUseCase.execute(
                userId,
                generationJobId as string,
                leads
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

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    };
    allLeadFind = async (req: Request, res: Response) => {
        try {
            const workspaceId = req.workspaceMember?.workspaceId
            const { generationJobId } = req.params
            const page = Number(req.query.page ?? 1)
            const leads = await this.allLeadFindUseCase.execute(
                {
                    workspaceId: workspaceId as string,
                    generationJobId: generationJobId as string,
                    page: page
                })
            return res.status(200).json(leads)

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
