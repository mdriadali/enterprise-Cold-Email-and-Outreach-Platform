import type { NextFunction, Request, Response } from "express";
import { AuthValidator } from "../../domain/auth/AuthValidator";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports";
import type { IUserRepository } from "../../application/ports/repositories/UserRepository-ports";
import { UserValidator } from "../../domain/user/UserValidator";

export class AuthMiddleware {
    constructor(
        private readonly jwtTokenProvider: IJwtTokenProvider,
        private readonly userRepository: IUserRepository

    ) { }

    async execute(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("[Auth Midlle] Request Recived")
            const token = req.cookies.accessToken
            AuthValidator.tokenValidator(token)
            const payload = await this.jwtTokenProvider.validateAccessToken(token)
            console.log(payload);
            const findUser = await this.userRepository.findById(payload.UserId)
            UserValidator.UserNotExist(findUser)
            console.log("[Auth Midlle] User valid");
            (req as any).user = findUser;

            next();
        } catch (error) {
            return res.status(500).json({
                message: error instanceof Error ? error.message : "somthing went wrong"
            });
        }
    }
}