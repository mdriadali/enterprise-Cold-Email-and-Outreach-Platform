import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports"
import { serverEnv } from "@repo/env/server-env";
import type { generateRefreshTokenTypes, TokenPayload } from "@repo/types";

export class JwtTokenGenerator implements IJwtTokenProvider {
    async generateAccessToken(UserId: string): Promise<string> {
        const acessToken: string = jwt.sign({
            UserId
        }, serverEnv.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        return acessToken
    }
    async generateRefreshToken(UserId: string): Promise<generateRefreshTokenTypes> {
        const REFRESH_TOKEN_DAYS = 30;

        const expiresAt = new Date(
            Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        )
        const refreshToken: string = jwt.sign({
            UserId
        }, serverEnv.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_DAYS });

        return { token: refreshToken, expiresAt: expiresAt }
    }

    async validateAccessToken(token: string): Promise<TokenPayload> {
        console.log("trying to validate access token")
        const payload = jwt.verify(
            token,
            serverEnv.JWT_ACCESS_SECRET!
        ) as TokenPayload
        return payload
    }
    async validateRefreshToken(token: string): Promise<TokenPayload> {
        console.log("trying to validate refresh token")
        const payload = jwt.verify(
            token,
            serverEnv.JWT_REFRESH_SECRET!
        ) as TokenPayload
        return payload
    }
}