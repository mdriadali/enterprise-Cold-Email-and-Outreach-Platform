import { AiProvider } from "@repo/db";
import { aiapiproviderInvalidError } from "./aiapierror";
import { SharedApiKeyEmpty } from "../sharedError";

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
}