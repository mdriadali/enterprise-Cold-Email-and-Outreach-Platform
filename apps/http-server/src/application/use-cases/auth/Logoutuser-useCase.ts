import { AuthValidator } from "../../../domain/auth/AuthValidator";
import { UnauthorizedError } from "../../../domain/auth/Error";
import type { IRefreshTokenRepository } from "../../ports/repositories/RefreshTokenRepository-ports";

export class LogoutUserUseCase {
    constructor(
        private readonly refreshTokenRepository: IRefreshTokenRepository

    ) { }
    async execute(userId: string, refreshToken: string) {
        console.log("[Logout] user trying", userId)
        const tokenData = await this.refreshTokenRepository.findByToken(refreshToken)
        AuthValidator.tokenDataValidator(tokenData)


        if (userId !== tokenData?.userId) {
            throw new UnauthorizedError()
        }

        await this.refreshTokenRepository.deleteByToken(refreshToken)
        return true
    }
}