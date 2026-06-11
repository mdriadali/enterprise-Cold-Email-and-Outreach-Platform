

// Name All errors

import { AppError } from "../AppError"

export class UserNameRequiredError extends AppError {
    constructor() {
        super("Name is required or invalid",400)
    }
}
export class UserNameMinError extends AppError {
    constructor() {
        super("Name must be at least 2 characters long",400)
    }
}
export class UserNameMaxError extends AppError {
    constructor() {
        super("Name must not exceed 20 characters",400)
    }
}


//Email all errors
export class UserEmailRequiredError extends AppError {
    constructor() {
        super("Email is required",400)
    }
}
export class UserEmailInvalidError extends AppError {
    constructor() {
        super("Email is invalid",400)
    }
}

//Password all errors
export class UserPasswordRequiredError extends AppError {
    constructor() {
        super("password is required",400)
    }
}
export class UserPasswordMinError extends AppError {
    constructor() {
        super("password must be at least 8 characters long",400)
    }
}
export class UserPasswordMaxError extends AppError {
    constructor() {
        super("password must not exceed 16 characters",400)
    }
}
export class UserExistError extends AppError {
    constructor() {
        super("user already exist",400)
    }
}
export class UserNotExistError extends AppError {
    constructor() {
        super("user not exist",400)
    }
}






