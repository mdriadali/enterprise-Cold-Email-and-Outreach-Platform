import { BcryptPasswordHasher, JwtTokenGenerator } from "@repo/infrastructure/auth"
import { PrismaAiApiRepository, PrismaGenerationJobRepository, PrismaLeadRepository, PrismaRefreshToken, PrismaUserRepository, PrismaWorkspace, PrismaWorkspaceMember } from "@repo/infrastructure/repositories"


export const bcryptPasswordHasher = new BcryptPasswordHasher
export const prismaUserRepository = new PrismaUserRepository
export const jwtTokenGenerator = new JwtTokenGenerator
export const prismaRefreshToken = new PrismaRefreshToken
export const workspaceRepository=new PrismaWorkspace
export const workspaceMemberRepository=new PrismaWorkspaceMember
export const prismaAiApiRepository=new PrismaAiApiRepository
export const generationJobRepository=new PrismaGenerationJobRepository 
export const leadRepository=new PrismaLeadRepository
