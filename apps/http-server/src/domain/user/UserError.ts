

// Name All errors

export class UserNameRequiredError extends Error {
    constructor() {
        super("Name is required or invalid")
    }
}
export class UserNameMinError extends Error {
    constructor() {
        super("Name must be at least 2 characters long")
    }
}
export class UserNameMaxError extends Error {
    constructor() {
        super("Name must not exceed 20 characters")
    }
}


//Email all errors
export class UserEmailRequiredError extends Error {
    constructor() {
        super("Email is required")
    }
}
export class UserEmailInvalidError extends Error {
    constructor() {
        super("Email is invalid")
    }
}

//Password all errors
export class UserPasswordRequiredError extends Error {
    constructor() {
        super("password is required")
    }
}
export class UserPasswordMinError extends Error {
    constructor() {
        super("password must be at least 8 characters long")
    }
}
export class UserPasswordMaxError extends Error {
    constructor() {
        super("password must not exceed 16 characters")
    }
}
export class UserExistError extends Error {
    constructor() {
        super("user already exist")
    }
}
export class UserNotExistError extends Error {
    constructor() {
        super("user not exist")
    }
}






