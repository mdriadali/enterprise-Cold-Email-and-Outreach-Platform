

// Name All errors

import { AppError } from "../AppError"

export class UserNameRequiredError extends AppError {
    constructor() {
        super("Name is required or invalid")
    }
}
export class UserNameMinError extends AppError {
    constructor() {
        super("Name must be at least 2 characters long")
    }
}
export class UserNameMaxError extends AppError {
    constructor() {
        super("Name must not exceed 20 characters")
    }
}


//Email all errors
export class UserEmailRequiredError extends AppError {
    constructor() {
        super("Email is required")
    }
}
export class UserEmailInvalidError extends AppError {
    constructor() {
        super("Email is invalid")
    }
}

//Password all errors
export class UserPasswordRequiredError extends AppError {
    constructor() {
        super("password is required")
    }
}
export class UserPasswordMinError extends AppError {
    constructor() {
        super("password must be at least 8 characters long")
    }
}
export class UserPasswordMaxError extends AppError {
    constructor() {
        super("password must not exceed 16 characters")
    }
}
export class UserExistError extends AppError {
    constructor() {
        super("user already exist")
    }
}
export class UserNotExistError extends AppError {
    constructor() {
        super("user not exist")
    }
}






