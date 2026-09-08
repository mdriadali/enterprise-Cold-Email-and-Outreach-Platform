import type { IUserRepository, IVerificationTokenStore, IAuthEmailQueue } from "@repo/ports"
import { generateRandomToken } from "@repo/common"
import { UserValidator } from "../../../domain/user/UserValidator"
import { AppError } from "../../../domain/AppError"
import { loggerEnv } from "@repo/env/logger-env"

const VERIFICATION_TTL_SECONDS = 15 * 60
const VERIFICATION_EXPIRY_MINUTES = 15

// In development/test we never enqueue real verification emails. This protects
// SMTP sender reputation from being harmed by test addresses/deliveries. Users
// are auto-verified on registration, so resending is not needed in these envs.
const SKIP_EMAIL_ENVIRONMENTS: ReadonlySet<string> = new Set(["development", "test"])

export class ResendVerificationEmailUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly verificationTokenStore: IVerificationTokenStore,
        private readonly authEmailQueue: IAuthEmailQueue,
        private readonly appUrl: string
    ) { }

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId)
        UserValidator.UserNotExist(user)

        if (user!.emailVerifiedAt) {
            throw new AppError("Email is already verified")
        }

        // Development/test: do not push verification emails to the queue. Users
        // are auto-verified here, so resending would only risk bad SMTP bounces.
        if (SKIP_EMAIL_ENVIRONMENTS.has(loggerEnv.NODE_ENV)) {
            return
        }

        const verificationToken = generateRandomToken()
        const verificationLink = `${this.appUrl}/verify-email?email=${encodeURIComponent(user!.email)}&token=${verificationToken}`

        await this.verificationTokenStore.set(
            `auth:verify:${user!.email}`,
            verificationToken,
            VERIFICATION_TTL_SECONDS
        )

        await this.authEmailQueue.addEmailJob({
            type: "verify-email",
            email: user!.email,
            name: user!.name,
            link: verificationLink,
            expiresInMinutes: VERIFICATION_EXPIRY_MINUTES
        })
    }
}
