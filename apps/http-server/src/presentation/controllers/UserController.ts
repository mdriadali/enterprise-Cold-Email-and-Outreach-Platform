import type { Request, Response } from "express";
import type { ProfileUseCase } from "../../application/use-cases/user/Profile-UseCase";
import { AppError } from "../../domain/AppError";
import type { UpdateUserDto } from "@repo/types";
import type { ProfileUpdateUseCase } from "../../application/use-cases/user/ProfileUpdate-useCase";

export class UserController {
    constructor(
        private readonly profileUseCase: ProfileUseCase,
        private readonly profileUpdateUseCase: ProfileUpdateUseCase
    ) { }
    profile = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id
            const userData = await this.profileUseCase.execute(userId)
            return res.status(200).json({ data: userData })
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

    profileUpdate = async (req: Request, res: Response) => {
        try {
            const userId = req.user.id

            const updateData: UpdateUserDto = {};

            if (req.body.name !== undefined) {
                updateData.name = req.body.name;
            }
            const updateUser = await this.profileUpdateUseCase.execute(userId, updateData)
            return res.status(200).json({
                updateData: updateUser
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
}
