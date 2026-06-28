import jwt, { type JwtPayload } from "jsonwebtoken";

import type { generateRefreshTokenTypes, TokenPayload } from "@repo/types";
import type { IJwtTokenProvider } from "@repo/ports";
import { authEnv } from "@repo/env/auth-env";



export class JwtTokenGenerator implements IJwtTokenProvider {
    async generateAccessToken(UserId: string): Promise<string> {
        const acessToken: string = jwt.sign({
            UserId
        }, authEnv.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        return acessToken
    }
    async generateRefreshToken(UserId: string): Promise<generateRefreshTokenTypes> {
        const REFRESH_TOKEN_DAYS = 30;

        const expiresAt = new Date(
            Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        )
        const refreshToken: string = jwt.sign({
            UserId
        }, authEnv.JWT_REFRESH_SECRET);

        return { token: refreshToken, expiresAt: expiresAt }
    }

    async validateAccessToken(token: string): Promise<TokenPayload> {
        console.log("trying to validate access token")
        const payload = jwt.verify(
            token,
            authEnv.JWT_ACCESS_SECRET!
        ) as TokenPayload
        return payload
    }
    async validateRefreshToken(token: string): Promise<TokenPayload> {
        console.log("trying to validate refresh token")
        const payload = jwt.verify(
            token,
            authEnv.JWT_REFRESH_SECRET!
        ) as TokenPayload
        console.log(payload)
        return payload
    }
}