import type { IAdminRepository } from "@repo/ports";
import type { AdminCampaignResponse, AdminPaginatedResponse } from "@repo/types";

export class AdminListCampaignsUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(page: number, limit: number): Promise<AdminPaginatedResponse<AdminCampaignResponse>> {
        const { data, total } = await this.adminRepository.listCampaigns(page, limit);
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
