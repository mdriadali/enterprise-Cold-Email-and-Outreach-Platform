import type { AiProvider, Role } from "@repo/db"

export interface Userdata {
    id: string
    name: string
    email: string
    password: string
    role: string
}

export interface CreatedUserData {
    id: string
    name: string,
    email: string,
}

export interface UpdateUserDto {
   name?: string;
    email?: string;
    remainingFreeWorkspaces?: number;
    role?: Role;
}