import type { UpdateUserDto } from "@repo/types";
import { UserEmailInvalidError, UserEmailRequiredError, UserExistError, UserNameMaxError, UserNameMinError, UserNameRequiredError, UserNotExistError, UserPasswordMaxError, UserPasswordMinError, UserPasswordRequiredError } from "./UserError";
import { UserRules } from "./UserRules";
import { InvalidAiProviderError, SharedApiKeyEmpty, SharedDataNotProvide } from "../sharedError";
import { AiProvider } from "@repo/db";

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

    static validateupdateData(data: UpdateUserDto) {
        if (Object.keys(data).length === 0) {
            throw new SharedDataNotProvide();
        }

        if (data.name !== undefined) {

            const name = data.name.trim();

            if (name === "") {
                throw new UserNameRequiredError();
            }

            if (name.length < UserRules.MIN_LENGTH_NAME) {
                throw new UserNameMinError();
            }

            if (name.length > UserRules.MAX_LENGTH_NAME) {
                throw new UserNameMaxError();
            }
        }

        if (
            data.aiProvider !== undefined &&
            !Object.values(AiProvider).includes(data.aiProvider)
        ) {
            throw new InvalidAiProviderError();
        }

        if (
            data.apiKey !== undefined &&
            data.apiKey.trim() === ""
        ) {
            throw new SharedApiKeyEmpty()
        }
    }


    static userExist(user: unknown) {
        if (user) {
            throw new UserExistError()
        }
    }

    static UserNotExist(user: unknown) {
        if (!user) {
            throw new UserNotExistError()
        }
    }
}