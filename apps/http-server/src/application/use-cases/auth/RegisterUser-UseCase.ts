import type { IJwtTokenProvider, IPasswordHasher, IRefreshTokenRepository, IUserRepository, IVerificationTokenStore, IAuthEmailQueue } from "@repo/ports"
import type { RegisterUserInput } from "@repo/types"
import { RegisterUserEntity } from "../../../domain/auth/Register-entity"
import { UserValidator } from "../../../domain/user/UserValidator"
import { generateRandomToken } from "@repo/common"
import { loggerEnv } from "@repo/env/logger-env"

const VERIFICATION_TTL_SECONDS = 15 * 60
const VERIFICATION_EXPIRY_MINUTES = 15

// In development/test we skip email verification entirely so that many test
// users can be created without sending/clicking real verification emails.
const AUTO_VERIFY_ENVIRONMENTS: ReadonlySet<string> = new Set(["development", "test"])

export class RegisterUserUseCase {

    constructor(
        private readonly passwordHasher: IPasswordHasher,
        private readonly userRepository: IUserRepository,
        private readonly jwtTokenProvider: IJwtTokenProvider,
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly verificationTokenStore: IVerificationTokenStore,
        private readonly authEmailQueue: IAuthEmailQueue,
        private readonly appUrl: string
    ) { }
    async execute(registerdata: RegisterUserInput) {
        new RegisterUserEntity(
            registerdata.name,
            registerdata.email,
            registerdata.password,
        )
        const deviceInfo = registerdata.deviceInfo
        const existUser = await this.userRepository.findByEmail(registerdata.email)

        UserValidator.userExist(existUser)


        const hashpassword = await this.passwordHasher.hash(registerdata.password)
        const createdUser = await this.userRepository.create({
            name: registerdata.name,
            email: registerdata.email,
            password: hashpassword
        })

        // Development/test: auto-verify the user and skip the email queue so
        // creating many test users does not require (or emit) real verification emails.
        if (AUTO_VERIFY_ENVIRONMENTS.has(loggerEnv.NODE_ENV)) {
            await this.userRepository.markEmailVerified(createdUser.email)
        } else {
            const verificationToken = generateRandomToken()
            const verificationLink = `${this.appUrl}/verify-email?email=${encodeURIComponent(createdUser.email)}&token=${verificationToken}`

            await this.verificationTokenStore.set(
                `auth:verify:${createdUser.email}`,
                verificationToken,
                VERIFICATION_TTL_SECONDS
            )

            await this.authEmailQueue.addEmailJob({
                type: "verify-email",
                email: createdUser.email,
                name: createdUser.name,
                link: verificationLink,
                expiresInMinutes: VERIFICATION_EXPIRY_MINUTES
            })
        }

        const accessToken = await this.jwtTokenProvider.generateAccessToken(createdUser.id)
        const refreshToken = await this.jwtTokenProvider.generateRefreshToken(createdUser.id)

        await this.refreshTokenRepository.create({
            token: refreshToken.token,
            userId: createdUser.id,
            deviceName: deviceInfo?.deviceName,
            ipAddress: deviceInfo?.ipAddress,
            userAgent: deviceInfo?.userAgent,
            expiresAt: refreshToken.expiresAt
        })

        return {
            accessToken,
            refreshToken
        };

    }
}
