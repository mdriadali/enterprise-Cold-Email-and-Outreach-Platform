import { AppError } from "../AppError";

export class UnauthorizedError extends AppError{
constructor(){super("Unauthorized")}
}

export class VerificationTokenInvalidError extends AppError {
    constructor() { super("Invalid or expired verification link") }
}

export class ResetTokenInvalidError extends AppError {
    constructor() { super("Invalid or expired reset link") }
}
