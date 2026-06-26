import type { IUserRepository } from "@repo/ports"
import { UserValidator } from "../../../domain/user/UserValidator"


export class ProfileUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }
    async execute(userId: string) {
        console.log("[profile] trying to get data User: ", userId)
        const userData = await this.userRepository.findById(userId)
        UserValidator.UserNotExist(userData)
        return {
            id: userData?.id,
            name: userData?.name,
            email: userData?.email,
            role: userData?.role,
        }
    }
}