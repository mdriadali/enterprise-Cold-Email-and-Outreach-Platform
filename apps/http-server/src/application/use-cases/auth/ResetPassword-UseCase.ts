import type { IPasswordHasher, IVerificationTokenStore, IUserRepository } from "@repo/ports";
import type { ResetPasswordInput } from "@repo/types";
import { ResetTokenInvalidError } from "../../../domain/auth/Error";
import { UserValidator } from "../../../domain/user/UserValidator";

export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly verificationTokenStore: IVerificationTokenStore,
    ) { }

    async execute(data: ResetPasswordInput): Promise<void> {
        const key = `auth:reset:${data.email}`

        const valid = await this.verificationTokenStore.verify(key, data.token)
        if (!valid) {
            throw new ResetTokenInvalidError()
        }

        const user = await this.userRepository.findByEmail(data.email)
        UserValidator.UserNotExist(user)
        UserValidator.validatePassword(data.password)

        const hashedPassword = await this.passwordHasher.hash(data.password)
        await this.userRepository.updateById(user!.id, { password: hashedPassword })
        await this.verificationTokenStore.delete(key)
    }
}
