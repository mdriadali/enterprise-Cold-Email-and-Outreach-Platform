import { AppError } from "../AppError";

export class WorkspaceIdInvalidError extends AppError{
    constructor(){
        super("Workspace Id Invalid")
    }
}


export class GenerationIdInvalidError extends AppError{
    constructor(){
        super("Generation Id Invalid")
    }
}