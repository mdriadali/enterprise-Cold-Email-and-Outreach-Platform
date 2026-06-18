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