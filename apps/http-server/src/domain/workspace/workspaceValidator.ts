import type { workspaceMemberData } from "@repo/types"
import { WorkspaceError, workspaceNameInvlid, workspaceNameMaxError, workspaceNameMinError } from "./workspaceError"
import { workspacerules } from "./workspaceRules"
import { Subscription, WorkspaceMemberRole, type Workspace } from "@repo/db"
import { BadRequestError } from "../sharedError"

export class WorkspaceValidator {
    static validateInputData(name: string, subscription: Subscription) {
        if (!name) {
            throw new workspaceNameInvlid()
        }
        if (name.length < workspacerules.MIN_NAME) {
            throw new workspaceNameMinError()
        }
        if (name.length > workspacerules.MAX_NAME) {
            throw new workspaceNameMaxError()
        }
        if (!Object.values(Subscription).includes(subscription)) {
            throw new BadRequestError("Subscription invalid")
        }
    }
    static validateId(id: string | null) {
        if (!id) {
            throw new WorkspaceError("WorkspaceId Invalid")
        }
    }

    static validateMemberdata(data: workspaceMemberData | null) {
        if (!data) {
            throw new WorkspaceError("This user is not a member of this workspace.")
        }
    }
    static validateInfoData(data: Workspace | null) {
        if (!data) {
            throw new WorkspaceError("this Workspace Have No Data")
        }
    }

    static validateFreeWorkspaceQuota(
        subscription: Subscription,
        remainingFreeWorkspaces: number
    ) {

        if (subscription !== Subscription.STARTER) {
            return;
        }


        if (remainingFreeWorkspaces <= 0) {
            throw new BadRequestError(
                "You have already used your free workspace quota."
            );
        }
    }

    static isOwner(userId: string, ownerId: string) {
        if (userId != ownerId) {
            throw new BadRequestError(" You are not owner this workspcae")
        }
    }

    static roleNotowner(role: WorkspaceMemberRole) {
        if (role === "OWNER") {
            throw new BadRequestError("Can not add another owner")
        }
    }

    static  validateMemberLimit(limitmember: number, membercount: number) {
        if (membercount >= limitmember) {
            throw new BadRequestError("Your plan member limit has been reached.")
        }
    }

}