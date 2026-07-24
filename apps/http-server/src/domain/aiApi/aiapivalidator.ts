import { AiProvider } from "@repo/db";
import { aiapiproviderInvalidError } from "./aiapierror";
import { BadRequestError, SharedApiKeyEmpty } from "../sharedError";

export class AiApiValidator {
    static createInput(provider: AiProvider, key: string) {
        if (!provider) {
            throw new aiapiproviderInvalidError()
        }
        if (!Object.values(AiProvider).includes(provider as AiProvider)) {
            throw new aiapiproviderInvalidError();
        }
        if (
            key !== undefined &&
            key.trim() === ""
        ) {
            throw new SharedApiKeyEmpty()
        }
    }

    static validateAiApiLimit(limitAiApi: number, aiApiCount: number) {
        if (aiApiCount >= limitAiApi) {
            throw new BadRequestError("Your plan Ai Api  limit has been reached.")

        }
    }

}