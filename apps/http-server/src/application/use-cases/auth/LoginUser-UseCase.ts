import type { LoginUserInput } from "@repo/types";
import { LoginUserEntity } from "../../../domain/auth/Login-entity";
import type { IUserRepository } from "../../ports/repositories/UserRepository-ports";
import { UserValidator } from "../../../domain/user/UserValidator";
import type { IPasswordHasher } from "../../ports/auth/IPasswordHasher-ports";
import type { IJwtTokenProvider } from "../../ports/auth/IJwtTokenProvider-ports";
import { AuthValidator } from "../../../domain/auth/AuthValidator";
import type { IRefreshTokenRepository } from "../../ports/repositories/RefreshTokenRepository-ports";

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly jwtTokenProvider: IJwtTokenProvider,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) { }


    async execute(LoginData: LoginUserInput) {
        console.log("[LOGIN] user attmting login:", LoginData.email);
        new LoginUserEntity(
            LoginData.email,
            LoginData.password
        )
        const userExist = await this.userRepository.findByEmail(LoginData.email)
        UserValidator.UserNotExist(userExist)
        console.log("[Login] user found")

        const isHashMatch = await this.passwordHasher.hashcompare(LoginData.password, userExist!.password)
        AuthValidator.isHashValidate(isHashMatch)

        console.log("[Login] password verified")

        const accessToken = await this.jwtTokenProvider.generateAccessToken(userExist!.id)
        const refreshToken = await this.jwtTokenProvider.generateRefreshToken(userExist!.id)
        console.log("[Login]jwt token generated")

        const deviceInfo = LoginData.deviceInfo

        await this.refreshTokenRepository.create({
            token: refreshToken.token,
            userId: userExist!.id,
            deviceName: deviceInfo?.deviceName,
            ipAddress: deviceInfo?.ipAddress,
            userAgent: deviceInfo?.userAgent,
            expiresAt: refreshToken.expiresAt

        })

        return { accessToken, refreshToken }

    }
}