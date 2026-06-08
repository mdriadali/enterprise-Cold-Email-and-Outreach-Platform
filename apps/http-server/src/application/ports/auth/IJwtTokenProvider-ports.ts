export interface IJwtTokenProvider{
    generateAccessToken(UserId:string):Promise<string>
    generateRefreshToken(UserId:string):Promise<string>
}