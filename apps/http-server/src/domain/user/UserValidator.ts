import { UserEmailInvalidError, UserEmailRequiredError, UserExistError, UserNameMaxError, UserNameMinError, UserNameRequiredError, UserPasswordMaxError, UserPasswordMinError, UserPasswordRequiredError } from "./UserError";
import { UserRules } from "./UserRules";

export class UserValidator {
    static validateName(name: string): void {
        if (!name) {
            throw new UserNameRequiredError()
        }

        if (name.length < UserRules.MIN_LENGTH_NAME) {
            throw new UserNameMinError()
        }
        if (name.length > UserRules.MAX_LENGTH_NAME) {
            throw new UserNameMaxError()
        }
    }

    static validateEmail(email: string) {
        if (!email) {
            throw new UserEmailRequiredError()
        }
        if (!email.includes("@") || !email.includes(".")) {
            throw new UserEmailInvalidError()
        }
    }


    static validatePassword(password: string) {
        if (!password) {
            throw new UserPasswordRequiredError()
        }
        if (password.length < UserRules.MIN_LENGTH_PASSWORD) {
            throw new UserPasswordMinError()
        }
        if (password.length > UserRules.MAX_LENGTH_PASSWORD) {
            throw new UserPasswordMaxError()
        }
    }


    static userExist(user:unknown){
        if(user){
            throw new UserExistError()
        }
    }
}