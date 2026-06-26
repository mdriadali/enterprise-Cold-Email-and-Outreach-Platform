import type { ErrorResponse, LeadData } from "@repo/types";

export interface IAiProvider {
    generate(apiKey: string,prompt:string): Promise<string |ErrorResponse>;
}