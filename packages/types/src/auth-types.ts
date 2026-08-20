import type { JwtPayload } from "jsonwebtoken";

export interface RegisterUserInput {
    name: string,
    email: string,
    password: string,
    deviceInfo?: {
        deviceName?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }
}

export interface LoginUserInput {
    email: string,
    password: string,
    deviceInfo?: {
        deviceName?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
    }
}



export interface TokenPayload extends JwtPayload {
    userId: string;
}
export interface generateRefreshTokenTypes {
    token: string
    expiresAt: Date
}

export interface RefreshTokenTypes {
    token: string
    userId: string
    deviceName?: string
    ipAddress?: string
    userAgent?: string
    expiresAt: Date
}

export interface RefreshtokenData {
    id: string
    token: string
    userId: string
    deviceName: string|null
    ipAddress: string|null
    userAgent: string|null
    createdAt: Date
    expiresAt: Date
}

export interface VerifyEmailInput {
    email: string
    token: string
}

export interface ForgotPasswordInput {
    email: string
}

export interface ResetPasswordInput {
    email: string
    token: string
    password: string
}

export interface AuthEmailJobData {
    type: "verify-email" | "forgot-password"
    email: string
    name: string
    link: string
    expiresInMinutes: number
}