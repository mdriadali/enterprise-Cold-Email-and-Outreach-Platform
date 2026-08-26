import type { IUserRepository, IWorkspaceMemberRepository } from "@repo/ports"
import { UserValidator } from "../../../domain/user/UserValidator"


export class ProfileUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly workspaceMemberRepository:IWorkspaceMemberRepository
    ) { }
    async execute(userId: string) {
        const userData = await this.userRepository.findById(userId)
        UserValidator.UserNotExist(userData)
        const workspaceMember=await this.workspaceMemberRepository.findbyUserId(userId)
        return {
            id: userData?.id,
            name: userData?.name,
            email: userData?.email,
            role: userData?.role,
            workspaceMember:workspaceMember
        }
    }
}