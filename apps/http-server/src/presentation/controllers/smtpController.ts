import type { Request, Response } from "express";
import type { CreateSmtpAccountuseCase } from "../../application/use-cases/smtp/createSmtpAccount-usecase";
import { AppError } from "../../domain/AppError";

export class SmtpAccountController {
    constructor(
        private readonly createSmtpAccountuseCase: CreateSmtpAccountuseCase
    ) { }
    create = async (req: Request, res: Response) => {
        console.log("[Smtp Account create] Request Recived")
        const workspaceId = req.workspaceMember?.workspaceId as string
        const { name, host, portNumber, username, password, fromName, fromEmail, replyTo, encryption } = req.body
        const port=Number(portNumber)
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
}