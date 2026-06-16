import { workspaceNameInvlid, workspaceNameMaxError, workspaceNameMinError } from "./workspaceError"
import { workspacerules } from "./workspaceRules"

export class workspaceValidator {
    static validateName(name: string) {
        if (!name) {
            throw new workspaceNameInvlid()
        }
        if (name.length < workspacerules.MIN_NAME) {
            throw new workspaceNameMinError()
        }
        if(name.length>workspacerules.MAX_NAME){
            throw new workspaceNameMaxError()
        }
    }
}