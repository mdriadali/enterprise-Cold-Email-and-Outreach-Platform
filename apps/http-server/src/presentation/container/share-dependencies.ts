import { BcryptPasswordHasher } from "../../infrastructure/auth/BcryptPasswordHasher"
import { JwtTokenGenerator } from "../../infrastructure/auth/JwtTokenGenerator"
import { PrismaRefreshToken } from "../../infrastructure/repositories/PrismaRefreshToken"
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository"

export const bcryptPasswordHasher = new BcryptPasswordHasher
export const prismaUserRepository = new PrismaUserRepository
export const jwtTokenGenerator = new JwtTokenGenerator
export const prismaRefreshToken = new PrismaRefreshToken