import type { IAdminRepository } from "@repo/ports";
import type { AdminUserDetailResponse } from "@repo/types";
import { AdminTargetNotFoundError } from "../../../domain/admin/AdminError";

export class AdminGetUserDetailUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(userId: string): Promise<AdminUserDetailResponse> {
        const user = await this.adminRepository.getUserDetail(userId);
        if (!user) {
            throw new AdminTargetNotFoundError();
        }
        return user;
    }
}
