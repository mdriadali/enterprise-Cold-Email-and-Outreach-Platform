import type { Request, Response } from "express";
import type { CreateSmtpAccountuseCase } from "../../application/use-cases/smtp/createSmtpAccount-usecase";
import { AppError } from "../../domain/AppError";
import type { FindAllSmtpAccountUseCase } from "../../application/use-cases/smtp/findAllSmtpAccount-useCase";
import type { UpdateSmtpAccountUseCase } from "../../application/use-cases/smtp/updateSmtpAccount-useCase";
import type { DeleteSmtpAccountUseCase } from "../../application/use-cases/smtp/deleteSmtpAccount-usecase";
import type { FindSmtpAccountUseCase } from "../../application/use-cases/smtp/findsmtpAccount-useCase";

export class SmtpAccountController {
    constructor(
        private readonly createSmtpAccountuseCase: CreateSmtpAccountuseCase,
        private readonly findAllSmtpAccountUseCase: FindAllSmtpAccountUseCase,
        private readonly updateSmtpAccountUseCase: UpdateSmtpAccountUseCase,
        private readonly deleteSmtpAccountUseCase: DeleteSmtpAccountUseCase,
        private readonly findSmtpAccountUseCase: FindSmtpAccountUseCase
    ) { }
    create = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { name, host, portNumber, username, password, fromName, fromEmail, replyTo, encryption } = req.body
        const port = Number(portNumber)
        try {
            const createSmtp = await this.createSmtpAccountuseCase.execute({ workspaceId, name, host, port, username, password, fromName, fromEmail, replyTo, encryption })
            return res.status(200).json(createSmtp)
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
    find = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        try {
            const smtp = await this.findSmtpAccountUseCase.execute(id as string, workspaceId)
            return res.status(200).json(smtp)
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

    findAllAcounts = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember?.workspaceId
        try {
            const accounts = await this.findAllSmtpAccountUseCase.execute(workspaceId as string)
            return res.status(200).json(accounts)
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

    update = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        const userid = req.user.id
        const { data } = req.body
        data.port = Number(data.port)
        try {
            const update = await this.updateSmtpAccountUseCase.execute(workspaceId as string, id as string, userid, data)
            return res.status(200).json(update)
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

    delete = async (req: Request, res: Response) => {
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        const userid = req.user.id
        try {
            const remove = await this.deleteSmtpAccountUseCase.execute(workspaceId as string, id as string, userid)
            return res.status(200).json(remove)
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
