import type { IAdminRepository } from "@repo/ports";
import type { AdminPaginatedResponse, AdminUserResponse } from "@repo/types";

export class AdminGetUsersUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(page: number, limit: number): Promise<AdminPaginatedResponse<AdminUserResponse>> {
        const { data, total } = await this.adminRepository.listUsers(page, limit);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
