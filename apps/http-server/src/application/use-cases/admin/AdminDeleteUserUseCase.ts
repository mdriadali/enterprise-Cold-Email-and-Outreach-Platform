import type { IAdminRepository } from "@repo/ports";
import { AdminCannotDeleteSelfError } from "../../../domain/admin/AdminError";

export class AdminDeleteUserUseCase {
    constructor(
        private readonly adminRepository: IAdminRepository
    ) { }

    async execute(actorId: string, userId: string): Promise<boolean> {
        if (actorId === userId) {
            throw new AdminCannotDeleteSelfError();
        }

        const deleted = await this.adminRepository.deleteUser(userId);

        return deleted;
    }
}
