import type { NextFunction, Request, Response } from "express";
import { AuthValidator } from "../../domain/auth/AuthValidator";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports";
import type { IUserRepository } from "../../application/ports/repositories/UserRepository-ports";
import { UserValidator } from "../../domain/user/UserValidator";
import jwt from "jsonwebtoken";

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
            const findUser = await this.userRepository.findById(payload.UserId)
            UserValidator.UserNotExist(findUser)
            console.log("[Auth Midlle] User valid");
            req.user = {
                id: findUser?.id,
                name: findUser?.name,
                email: findUser!.email,
                role: findUser?.role,
                subscription: findUser?.subscription,
            };

            return next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.log("[Auth middleware] user access token expire")
                return res.status(401).json({
                    code: "TOKEN_EXPIRED"
                })
            }

            return res.status(401).json({
                code: "TOKEN_INVALID"
            })
        }
    }
}