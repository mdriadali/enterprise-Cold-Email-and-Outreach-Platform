import type { IRefreshTokenRepository } from "@repo/ports";
import { AuthValidator } from "../../../domain/auth/AuthValidator";
import { UnauthorizedError } from "../../../domain/auth/Error";


export class LogoutUserUseCase {
    constructor(
        private readonly refreshTokenRepository: IRefreshTokenRepository

    ) { }
    async execute(userId: string, refreshToken: string) {
        const tokenData = await this.refreshTokenRepository.findByToken(refreshToken)
        AuthValidator.tokenDataValidator(tokenData)


        if (userId !== tokenData?.userId) {
            throw new UnauthorizedError()
        }

        await this.refreshTokenRepository.deleteByToken(refreshToken)
        return true
    }
}
