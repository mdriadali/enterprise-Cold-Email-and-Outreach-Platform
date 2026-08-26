import type { IJwtTokenProvider, IPasswordHasher, IRefreshTokenRepository, IUserRepository } from "@repo/ports";
import type { LoginUserInput } from "@repo/types";
import { LoginUserEntity } from "../../../domain/auth/Login-entity";
import { UserValidator } from "../../../domain/user/UserValidator";
import { AuthValidator } from "../../../domain/auth/AuthValidator";


export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly jwtTokenProvider: IJwtTokenProvider,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) { }


    async execute(LoginData: LoginUserInput) {
        new LoginUserEntity(
            LoginData.email,
            LoginData.password
        )
        const userExist = await this.userRepository.findByEmail(LoginData.email)
        UserValidator.UserNotExist(userExist)

        const isHashMatch = await this.passwordHasher.hashcompare(LoginData.password, userExist!.password)
        AuthValidator.isHashValidate(isHashMatch)

        const accessToken = await this.jwtTokenProvider.generateAccessToken(userExist!.id)
        const refreshToken = await this.jwtTokenProvider.generateRefreshToken(userExist!.id)

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
