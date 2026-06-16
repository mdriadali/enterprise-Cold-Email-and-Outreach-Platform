import type { AiProvider } from "@repo/db"

export interface Userdata {
    id: string
    name: string
    email: string
    password: string
    role: string
    subscription: string
    aiProvider: string
    apiKey: string
}

export interface CreatedUserData {
    id: string
    name: string,
    email: string,
}

export interface UpdateUserDto {
  name?: string;
  aiProvider?:AiProvider;
  apiKey?: string;
}