import jwt from "jsonwebtoken";
import type { IJwtTokenProvider } from "../../application/ports/auth/IJwtTokenProvider-ports"
import { env } from "@repo/env";

export class JwtTokenGenerator implements IJwtTokenProvider {
    async generateAccessToken(UserId: string): Promise<string> {
        const acessToken: string = jwt.sign({
            data: UserId
        }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

        return acessToken
    }
    async generateRefreshToken(UserId: string): Promise<string> {
        const refreshToken: string = jwt.sign({
            data: UserId
        }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

        return refreshToken
    }
}