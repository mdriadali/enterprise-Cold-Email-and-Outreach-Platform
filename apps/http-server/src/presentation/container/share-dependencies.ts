import { BcryptPasswordHasher } from "../../infrastructure/auth/BcryptPasswordHasher"
import { JwtTokenGenerator } from "../../infrastructure/auth/JwtTokenGenerator"
import { PrismaAiApiRepository } from "../../infrastructure/repositories/PrismaAiApiRepository"
import { PrismaGenerationJobRepository } from "../../infrastructure/repositories/PrismaGenerationJobRepository"
import { PrismaRefreshToken } from "../../infrastructure/repositories/PrismaRefreshToken"
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository"
import { PrismaWorkspace } from "../../infrastructure/repositories/PrismaWorkspace"
import { PrismaWorkspaceMember } from "../../infrastructure/repositories/PrismaWorkspaceMemberRepository"

export const bcryptPasswordHasher = new BcryptPasswordHasher
export const prismaUserRepository = new PrismaUserRepository
export const jwtTokenGenerator = new JwtTokenGenerator
export const prismaRefreshToken = new PrismaRefreshToken
export const workspaceRepository=new PrismaWorkspace
export const workspaceMemberRepository=new PrismaWorkspaceMember
export const prismaAiApiRepository=new PrismaAiApiRepository
export const generationJobRepository=new PrismaGenerationJobRepository 
