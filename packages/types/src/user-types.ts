import type { Role } from "./enums"

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
    password?: string;
    emailVerifiedAt?: Date | null;
    remainingFreeWorkspaces?: number;
    role?: Role;
}


export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}
