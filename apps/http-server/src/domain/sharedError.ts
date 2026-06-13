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