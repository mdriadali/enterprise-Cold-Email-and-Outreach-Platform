import type { generateRefreshTokenTypes, TokenPayload } from "@repo/types"

export interface IJwtTokenProvider{
    generateAccessToken(UserId:string):Promise<string>
    generateRefreshToken(UserId:string):Promise< generateRefreshTokenTypes>
    validateAccessToken(token:string):Promise<TokenPayload>
    validateRefreshToken(token:string):Promise<TokenPayload>
}