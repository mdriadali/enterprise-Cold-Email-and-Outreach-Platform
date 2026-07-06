import { BcryptPasswordHasher, JwtTokenGenerator } from "@repo/infrastructure/auth"
import { PrismaAiApiRepository, PrismaCampaignEmailRepository, PrismaCampaignRepository, PrismaGenerationJobRepository, PrismaLeadRepository, PrismaRefreshToken, PrismaSmtpAccountRepository, PrismaUserRepository, PrismaWorkspace, PrismaWorkspaceMember } from "@repo/infrastructure/repositories"


export const bcryptPasswordHasher = new BcryptPasswordHasher
export const prismaUserRepository = new PrismaUserRepository
export const jwtTokenGenerator = new JwtTokenGenerator
export const prismaRefreshToken = new PrismaRefreshToken
export const workspaceRepository=new PrismaWorkspace
export const workspaceMemberRepository=new PrismaWorkspaceMember
export const prismaAiApiRepository=new PrismaAiApiRepository
export const generationJobRepository=new PrismaGenerationJobRepository 
export const leadRepository=new PrismaLeadRepository
export const smtpAccountRepository=new PrismaSmtpAccountRepository
export const campaignRepository=new PrismaCampaignRepository
export const campaignEmailRepository=new PrismaCampaignEmailRepository
