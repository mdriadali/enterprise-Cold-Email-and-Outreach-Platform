import type { RefreshtokenData } from "@repo/types"
import { UnauthorizedError } from "./Error"


export class AuthValidator {
    static isHashValidate(match: boolean) {
        if (match === false) {
            throw new Error("Invalid credentials")
        }
    }

    static tokenValidator(token: string) {
        if (!token) {
            throw new UnauthorizedError()
        }
    }
    static tokenDataValidator(tokenData: RefreshtokenData | null) {
        if (!tokenData) {
            throw new UnauthorizedError()
        }
    }
}