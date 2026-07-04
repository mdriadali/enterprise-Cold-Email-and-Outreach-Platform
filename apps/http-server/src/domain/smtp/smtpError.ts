import { AppError } from "../AppError";

export class SmtpError extends AppError{
    constructor(message:string){
        super(message)
    }
}