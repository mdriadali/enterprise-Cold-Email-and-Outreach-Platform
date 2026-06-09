import type { TokenPayload } from "@repo/types"

export interface IJwtTokenProvider{
    generateAccessToken(UserId:string):Promise<string>
    generateRefreshToken(UserId:string):Promise<string>
    validateAccessToken(token:string):Promise<TokenPayload>
}