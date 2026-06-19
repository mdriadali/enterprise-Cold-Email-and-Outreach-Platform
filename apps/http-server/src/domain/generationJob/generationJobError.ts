import { AppError } from "../AppError";

export class WorkspaceIdInvalidError extends AppError{
    constructor(){
        super("Workspace Id Invalid")
    }
}
export class notAccessWorkspace extends AppError{
    constructor(){
        super("You don't have access to this workspace")
    }
}