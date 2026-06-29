import { AppError } from "../AppError";

export class WorkspaceIdInvalidError extends AppError{
    constructor(){
        super("Workspace Id Invalid")
    }
}


export class GenerationError extends AppError{
    constructor(message:string){
        super(message)
    }
}