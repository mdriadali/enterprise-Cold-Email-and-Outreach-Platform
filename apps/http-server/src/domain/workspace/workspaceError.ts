import { AppError } from "../AppError";
import { workspacerules } from "./workspaceRules";

export class workspaceNameInvlid extends AppError {
    constructor() {
        super("Workspace name invalid")
    }
}

export class workspaceNameMinError extends AppError {
    constructor() {
        super(`Workspace name must be at least ${workspacerules.MIN_NAME} characters long`)
    }
}
export class workspaceNameMaxError extends AppError {
    constructor() {
        super(`Name must not exceed ${workspacerules.MAX_NAME} characters`)
    }
}

export class WorkspaceError extends AppError{
    constructor(messae:string){super(messae)}
}