import { randomBytes } from "crypto";

export const generateRandomToken = (bytes = 32): string => {
    return randomBytes(bytes).toString("hex");
}
