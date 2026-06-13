import type { UpdateUserDto } from "@repo/types";
import type { IUserRepository } from "../../ports/repositories/UserRepository-ports";
import { UserValidator } from "../../../domain/user/UserValidator";
import { maskApiKey } from "../../../utils/maskApiKey";


export class ProfileUpdateUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }
    async execute(userid: string, updateData: UpdateUserDto) {

        UserValidator.validateupdateData(updateData)
        const updateUser = await this.userRepository.updateById(userid, updateData)
        const maskApi = maskApiKey(updateUser.apiKey)
        return {
            id: updateUser?.id,
            name: updateUser?.name,
            email: updateUser?.email,
            role: updateUser?.role,
            aiProvider: updateUser?.aiProvider,
            apiKey: maskApi
        }
    }
}