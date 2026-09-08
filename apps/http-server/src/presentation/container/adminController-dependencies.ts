import { AdminGetUsersUseCase } from "../../application/use-cases/admin/AdminGetUsersUseCase";
import { AdminGetUserDetailUseCase } from "../../application/use-cases/admin/AdminGetUserDetailUseCase";
import { AdminUpdateUserRoleUseCase } from "../../application/use-cases/admin/AdminUpdateUserRoleUseCase";
import { AdminDeleteUserUseCase } from "../../application/use-cases/admin/AdminDeleteUserUseCase";
import { AdminListWorkspacesUseCase } from "../../application/use-cases/admin/AdminListWorkspacesUseCase";
import { AdminGetWorkspaceDetailUseCase } from "../../application/use-cases/admin/AdminGetWorkspaceDetailUseCase";
import { AdminListCampaignsUseCase } from "../../application/use-cases/admin/AdminListCampaignsUseCase";
import { AdminGetStatsUseCase } from "../../application/use-cases/admin/AdminGetStatsUseCase";
import { AdminController } from "../controllers/AdminController";
import { adminRepository } from "./share-dependencies";

const adminGetUsersUseCase = new AdminGetUsersUseCase(adminRepository);
const adminGetUserDetailUseCase = new AdminGetUserDetailUseCase(adminRepository);
const adminUpdateUserRoleUseCase = new AdminUpdateUserRoleUseCase(adminRepository);
const adminDeleteUserUseCase = new AdminDeleteUserUseCase(adminRepository);
const adminListWorkspacesUseCase = new AdminListWorkspacesUseCase(adminRepository);
const adminGetWorkspaceDetailUseCase = new AdminGetWorkspaceDetailUseCase(adminRepository);
const adminListCampaignsUseCase = new AdminListCampaignsUseCase(adminRepository);
const adminGetStatsUseCase = new AdminGetStatsUseCase(adminRepository);

export const adminController = new AdminController(
    adminGetUsersUseCase,
    adminGetUserDetailUseCase,
    adminUpdateUserRoleUseCase,
    adminDeleteUserUseCase,
    adminListWorkspacesUseCase,
    adminGetWorkspaceDetailUseCase,
    adminListCampaignsUseCase,
    adminGetStatsUseCase
);
