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
    constructor(){
        super("You don't have access")
    }
}