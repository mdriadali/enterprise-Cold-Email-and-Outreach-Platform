import type { IUserRepository, IVerificationTokenStore, IAuthEmailQueue } from "@repo/ports"
import { generateRandomToken } from "@repo/common"
import { UserValidator } from "../../../domain/user/UserValidator"
import { AppError } from "../../../domain/AppError"

const VERIFICATION_TTL_SECONDS = 15 * 60
const VERIFICATION_EXPIRY_MINUTES = 15

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
