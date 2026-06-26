import type { RefreshtokenData, RefreshTokenTypes } from "@repo/types";

export interface IRefreshTokenRepository {
    create(data: RefreshTokenTypes): Promise<void>
    findByToken(token:string):Promise<RefreshtokenData|null>
    deleteByToken(token:string):Promise<void>

}