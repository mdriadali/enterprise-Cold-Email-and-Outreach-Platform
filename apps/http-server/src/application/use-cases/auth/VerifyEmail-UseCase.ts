import type { IVerificationTokenStore, IUserRepository } from "@repo/ports";
import type { VerifyEmailInput } from "@repo/types";
import { VerificationTokenInvalidError } from "../../../domain/auth/Error";
import { UserValidator } from "../../../domain/user/UserValidator";

export class VerifyEmailUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly verificationTokenStore: IVerificationTokenStore,
    ) { }

    async execute(data: VerifyEmailInput): Promise<void> {
        const key = `auth:verify:${data.email}`

        const valid = await this.verificationTokenStore.verify(key, data.token)
        if (!valid) {
            throw new VerificationTokenInvalidError()
        }

        const user = await this.userRepository.findByEmail(data.email)
        UserValidator.UserNotExist(user)

        await this.userRepository.markEmailVerified(data.email)
        await this.verificationTokenStore.delete(key)
    }
}
