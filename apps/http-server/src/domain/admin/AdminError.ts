import { AppError } from "../AppError";

export class AdminAccessDeniedError extends AppError {
    constructor() {
        super("Admin access denied")
    }
}

export class AdminTargetNotFoundError extends AppError {
    constructor() {
        super("Admin target not found")
    }
}

export class AdminInvalidRoleError extends AppError {
    constructor() {
        super("Invalid role")
    }
}

export class AdminCannotModifySelfError extends AppError {
    constructor() {
        super("Admin cannot modify own role")
    }
}

export class AdminCannotDeleteSelfError extends AppError {
    constructor() {
        super("Admin cannot delete own account")
    }
}
