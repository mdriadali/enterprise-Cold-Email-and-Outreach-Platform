import { AdminInvalidRoleError } from "./AdminError";
import { AdminRules } from "./AdminRules";

export class AdminValidator {
    static resolvePagination(page: unknown, limit: unknown): { page: number; limit: number } {
        const parsedPage = Number(page ?? AdminRules.DEFAULT_PAGE);
        const parsedLimit = Number(limit ?? AdminRules.DEFAULT_LIMIT);

        const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : AdminRules.DEFAULT_PAGE;
        const safeLimit =
            Number.isFinite(parsedLimit) && parsedLimit > 0
                ? Math.min(parsedLimit, AdminRules.MAX_LIMIT)
                : AdminRules.DEFAULT_LIMIT;

        return { page: Math.floor(safePage), limit: Math.floor(safeLimit) };
    }

    static validateRole(role: unknown): "ADMIN" | "USER" {
        if (role !== "ADMIN" && role !== "USER") {
            throw new AdminInvalidRoleError();
        }
        return role;
    }
}
