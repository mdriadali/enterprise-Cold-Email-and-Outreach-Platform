import type { IAuthEmailQueue, IVerificationTokenStore, IUserRepository } from "@repo/ports";
import type { ForgotPasswordInput } from "@repo/types";
import { generateRandomToken } from "@repo/common";

const RESET_TTL_SECONDS = 15 * 60
const RESET_EXPIRY_MINUTES = 15

export class ForgotPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly verificationTokenStore: IVerificationTokenStore,
        private readonly authEmailQueue: IAuthEmailQueue,
        private readonly appUrl: string,
    ) { }

    async execute(data: ForgotPasswordInput): Promise<void> {
        const user = await this.userRepository.findByEmail(data.email)

        if (!user) {
            return
        }

        const resetToken = generateRandomToken()
        const resetLink = `${this.appUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${resetToken}`

        await this.verificationTokenStore.set(
            `auth:reset:${user.email}`,
            resetToken,
            RESET_TTL_SECONDS
        )

        await this.authEmailQueue.addEmailJob({
            type: "forgot-password",
            email: user.email,
            name: user.name,
            link: resetLink,
            expiresInMinutes: RESET_EXPIRY_MINUTES
        })
    }
}
