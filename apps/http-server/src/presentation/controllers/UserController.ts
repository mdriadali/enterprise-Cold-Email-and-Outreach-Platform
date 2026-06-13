import type { Request, Response } from "express";
import type { ProfileUseCase } from "../../application/use-cases/user/Profile-UseCase";
import { AppError } from "../../domain/AppError";

export class UserController {
    constructor(
        private readonly profileUseCase: ProfileUseCase
    ) { }
    profile = async (req: Request, res: Response) => {
        try {
            console.log("[profile] Request Recived")
            const userId = req.user.id
            const userData = await this.profileUseCase.execute(userId)
            console.log("[profile] data send sucessfully")
            return res.status(200).json({ data: userData })
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(400).json({
                    message: error.message
                })
            }
            console.error("[profile] Internal Server Error", error)
            return res.status(500).json({
                message: "Internal Server Error"
            })
        }
    }
}