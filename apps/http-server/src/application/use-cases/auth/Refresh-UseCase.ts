import { AuthValidator } from "../../../domain/auth/AuthValidator";
import type { IJwtTokenProvider } from "../../ports/auth/IJwtTokenProvider-ports";
import type { IRefreshTokenRepository } from "../../ports/repositories/RefreshTokenRepository-ports";

export class RefreshUseCase{

    constructor(
        private readonly refreshTokenRepository:IRefreshTokenRepository,
        private readonly jwtTokenProvider :IJwtTokenProvider
    ){}

    async execute(token:string){
        AuthValidator.tokenValidator(token)

        await this.jwtTokenProvider.validateRefreshToken(token)

       const tokenData= await this.refreshTokenRepository.findByToken(token)

       AuthValidator.tokenDataValidator(tokenData)

       AuthValidator.refreshTokenExpire(tokenData!.expiresAt)

       const accessToken =await this.jwtTokenProvider.generateAccessToken(tokenData!.userId)
       return {accessToken}
    }
}