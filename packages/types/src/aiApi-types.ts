import { string } from "zod"

export interface aiApiData {
    id: string,
    ownerId: string,
    aiProvider: string,
    apiKey: string,
    tokenUsed: Number,
    totalGenaration: Number,
    status: string,
    createdAt: Date
}





export interface ErrorResponse {
    error: {
        type: "RATE_LIMIT" | "INVALID_API_KEY" | "SERVICE_UNAVAILABLE";
        code: number;
        message: string;
    };
}

