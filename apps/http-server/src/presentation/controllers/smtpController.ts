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
        console.log("[Smtp Account create] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { name, host, portNumber, username, password, fromName, fromEmail, replyTo, encryption } = req.body
        const port = Number(portNumber)
        try {
            const createSmtp = await this.createSmtpAccountuseCase.execute({ workspaceId, name, host, port, username, password, fromName, fromEmail, replyTo, encryption })
            console.log("[Smtp Account create] Sucessfully")
            return res.status(200).json(createSmtp)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[Smtp Account create] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
    find = async (req: Request, res: Response) => {
        console.log("[Smtp Account Find] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        try {
            const smtp = await this.findSmtpAccountUseCase.execute(id as string, workspaceId)
            console.log("[Smtp Account Find] Sucessfully")
            return res.status(200).json(smtp)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[Smtp Account find] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    findAllAcounts = async (req: Request, res: Response) => {
        console.log("[All Smtp Account Find] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId
        try {
            const accounts = await this.findAllSmtpAccountUseCase.execute(workspaceId as string)
            console.log("[All Smtp Account Find] Sucessfully")
            return res.status(200).json(accounts)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[All Smtp Account find] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    update = async (req: Request, res: Response) => {
        console.log("[Update Smtp Account ] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        const userid = req.user.id
        const { data } = req.body
        data.port = Number(data.port)
        try {
            const update = await this.updateSmtpAccountUseCase.execute(workspaceId as string, id as string, userid, data)
            console.log("[Update Smtp Account ] Sucessfully")
            return res.status(200).json(update)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[Update Smtp Account] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }

    delete = async (req: Request, res: Response) => {
        console.log("[Delete Smtp Account ] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId
        const { id } = req.params
        const userid = req.user.id
        try {
            const remove = await this.deleteSmtpAccountUseCase.execute(workspaceId as string, id as string, userid)
            console.log("[Delete Smtp Account ] Sucessfully")
            return res.status(200).json(remove)
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                });
            }

            console.error(
                "[Delete Smtp Account] Internal Server Error",
                error
            );

            return res.status(500).json({
                message: "Internal Server Error"
            });
        }
    }
}