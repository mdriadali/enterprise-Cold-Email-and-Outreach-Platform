import { AppError } from "../AppError";

export class aiapiproviderInvalidError extends AppError{
    constructor(){
        super("Invalid api Provider")
    }
}