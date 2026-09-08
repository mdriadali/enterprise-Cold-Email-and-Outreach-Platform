import type { IAdminRepository } from "@repo/ports";
import type { AdminWorkspaceDetailResponse } from "@repo/types";
import { AdminTargetNotFoundError } from "../../../domain/admin/AdminError";

export class AdminGetWorkspaceDetailUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(workspaceId: string): Promise<AdminWorkspaceDetailResponse> {
        const workspace = await this.adminRepository.getWorkspaceDetail(workspaceId);
        if (!workspace) {
            throw new AdminTargetNotFoundError();
        }
        return workspace;
    }
}
