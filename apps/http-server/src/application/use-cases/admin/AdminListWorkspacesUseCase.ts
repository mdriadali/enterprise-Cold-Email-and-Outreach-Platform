import type { IAdminRepository } from "@repo/ports";
import type { AdminPaginatedResponse, AdminWorkspaceResponse } from "@repo/types";

export class AdminListWorkspacesUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(page: number, limit: number): Promise<AdminPaginatedResponse<AdminWorkspaceResponse>> {
        const { data, total } = await this.adminRepository.listWorkspaces(page, limit);
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
