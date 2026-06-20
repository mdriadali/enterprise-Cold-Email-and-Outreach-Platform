import { AppError } from "../AppError";

export class LeadInvalid extends AppError{
constructor(){
    super("Invalid lead Data")
}
}
export class notAcessGenerationJob extends AppError{
constructor(){
    super("You don't have access to this generation job")
}
}