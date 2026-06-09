import type { JwtPayload } from "jsonwebtoken";

export interface RegisterUserInput {
    name: string,
    email: string,
    password: string,
}

export interface LoginUserInput {
    email: string,
    password: string,
}



export interface TokenPayload extends JwtPayload {
    userId: string;
}