import jwt from "jsonwebtoken";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports"
import { serverEnv } from "@repo/env/server-env";

export class JwtTokenGenerator implements IJwtTokenProvider {
    async generateAccessToken(UserId: string): Promise<string> {
        const acessToken: string = jwt.sign({
            data: UserId
        }, serverEnv.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        return acessToken
    }
    async generateRefreshToken(UserId: string): Promise<string> {
        const refreshToken: string = jwt.sign({
            data: UserId
        }, serverEnv.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return refreshToken
    }
}