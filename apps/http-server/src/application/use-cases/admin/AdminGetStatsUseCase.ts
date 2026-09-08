import type { IAdminRepository } from "@repo/ports";
import type { AdminStatsResponse } from "@repo/types";

export class AdminGetStatsUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(): Promise<AdminStatsResponse> {
        return this.adminRepository.getStats();
    }
}
