import type { workspaceMemberData } from "@repo/types"
import { WorkspaceError, workspaceNameInvlid, workspaceNameMaxError, workspaceNameMinError } from "./workspaceError"
import { workspacerules } from "./workspaceRules"

export class WorkspaceValidator {
    static validateName(name: string) {
        if (!name) {
            throw new workspaceNameInvlid()
        }
        if (name.length < workspacerules.MIN_NAME) {
            throw new workspaceNameMinError()
        }
        if (name.length > workspacerules.MAX_NAME) {
            throw new workspaceNameMaxError()
        }
    }
    static validateId(id: string | null) {
        if (!id) {
            throw new WorkspaceError("WorkspaceId Invalid")
        }
    }

    static validateMemberdata(data:workspaceMemberData |null){
        if(!data){
            throw new WorkspaceError("This user is not a member of this workspace.")
        }
    }
}