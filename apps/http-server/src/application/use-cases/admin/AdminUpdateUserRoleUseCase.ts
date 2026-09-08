import type { IAdminRepository } from "@repo/ports";
import type { AdminUserResponse } from "@repo/types";
import { AdminCannotModifySelfError, AdminTargetNotFoundError } from "../../../domain/admin/AdminError";

export class AdminUpdateUserRoleUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(actorId: string, userId: string, role: "ADMIN" | "USER"): Promise<AdminUserResponse> {
        if (actorId === userId) {
            throw new AdminCannotModifySelfError();
        }

        const updated = await this.adminRepository.updateUserRole(userId, role);
        if (!updated) {
            throw new AdminTargetNotFoundError();
        }

        return updated;
    }
}
