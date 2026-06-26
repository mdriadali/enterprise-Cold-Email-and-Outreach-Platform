import type { UpdateUserDto } from "@repo/types";

import { UserValidator } from "../../../domain/user/UserValidator";
import type { IUserRepository } from "@repo/ports";


export class ProfileUpdateUseCase {
    constructor(
        private readonly userRepository: IUserRepository
    ) { }
    async execute(userid: string, updateData: UpdateUserDto) {

        UserValidator.validateupdateData(updateData)
        const updateUser = await this.userRepository.updateById(userid, updateData)
        return {
            id: updateUser?.id,
            name: updateUser?.name,
            email: updateUser?.email,
            role: updateUser?.role,
        }
    }
}