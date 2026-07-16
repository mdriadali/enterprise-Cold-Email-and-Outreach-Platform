import { AppError } from "./AppError";

export class SharedDataNotProvide extends AppError {
    constructor() {
        super("No data provided")
    }
}
export class InvalidAiProviderError extends AppError {
    constructor() {
        super("Invalid AI Provider");
    }
}
export class SharedApiKeyEmpty extends AppError {
    constructor() {
        super("Api key cannot be empty")
    }
}

export class generationJobIdInvalid extends AppError{
    constructor(){
        super("invalid generationJobId")
    }
}

export class notAccess extends AppError{
    constructor(message:string){
        super(message)
    }
}

export class BadRequestError extends AppError{
    constructor(message:string){
        super(message)
    }
}
