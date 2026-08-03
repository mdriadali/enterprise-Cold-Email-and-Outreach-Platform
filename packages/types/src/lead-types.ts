import type { LeadStatus } from "./enums";

export type JsonArray = JsonValue[];
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
export type InputJsonArray = readonly (InputJsonValue | null)[];
export type InputJsonObject = { readonly [Key in string]?: InputJsonValue | null };
export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown };

export interface leadInputdata {
    email: string,
    metadata: InputJsonValue
}
export interface LeadData {
    id: string
    generationJobId: string

    email: string

    metadata: JsonValue

    status: LeadStatus

    generatedEmailData?: JsonValue | null;
    createdAt: Date
    updatedAt: Date
}

export interface FindAllLeadInputdata {
    workspaceId: string,
    generationJobId: string,
    page: number
}

export interface LeadEmailData {
    email: string;
    subject: string;
    greeting:string
    body: string;
    signature?: string;
}
