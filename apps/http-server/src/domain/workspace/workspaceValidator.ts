import type {  workspaceMemberData } from "@repo/types"
import { WorkspaceError, workspaceNameInvlid, workspaceNameMaxError, workspaceNameMinError } from "./workspaceError"
import { workspacerules } from "./workspaceRules"
import { Subscription, type Workspace } from "@repo/db"
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

}