import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports"
import { serverEnv } from "@repo/env/server-env";
import type { TokenPayload } from "@repo/types";

export class JwtTokenGenerator implements IJwtTokenProvider {
    async generateAccessToken(UserId: string): Promise<string> {
        const acessToken: string = jwt.sign({
            UserId
        }, serverEnv.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        return acessToken
    }
    async generateRefreshToken(UserId: string): Promise<string> {
        const refreshToken: string = jwt.sign({
            UserId
        }, serverEnv.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return refreshToken
    }

    async validateAccessToken(token: string): Promise<TokenPayload> {

        const payload = jwt.verify(
            token,
            serverEnv.JWT_ACCESS_SECRET!
        ) as TokenPayload
        return payload
    }
}