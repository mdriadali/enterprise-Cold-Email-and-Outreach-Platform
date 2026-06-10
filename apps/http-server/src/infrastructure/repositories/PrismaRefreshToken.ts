import type { RefreshtokenData, RefreshTokenTypes } from "@repo/types";
import type { IRefreshTokenRepository } from "../../application/ports/repositories/RefreshTokenRepository-ports";
import { prismaClient } from "@repo/db";

export class PrismaRefreshToken implements IRefreshTokenRepository {
    async create(data: RefreshTokenTypes): Promise<void> {

        await prismaClient.refreshToken.create({
            data: {
                token: data.token,
                userId: data.userId,
                deviceName: data.deviceName,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                expiresAt: data.expiresAt
            }
        })
    }

    async findByToken(token: string): Promise<RefreshtokenData | null> {
        const tokenData = await prismaClient.refreshToken.findUnique({
            where: {
                token: token
            }
        })

        if (!tokenData) {
            return null
        }
        return {
            id: tokenData.id,
            token: tokenData.token,
            userId: tokenData.userId,
            deviceName: tokenData.deviceName,
            ipAddress: tokenData.ipAddress,
            userAgent: tokenData.userAgent,
            createdAt: tokenData.createdAt,
            expiresAt: tokenData.expiresAt
        }
    }

    async deleteByToken(token: string): Promise<void> {
        await prismaClient.refreshToken.delete(
            {
                where: {
                    token
                }
            }
        )
    }

}