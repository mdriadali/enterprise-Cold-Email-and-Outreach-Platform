import { AiProviderFactory } from "@repo/infrastructure/ai"
import { PrismaAiApiRepository, PrismaCampaignEmailRepository, PrismaCampaignRepository, PrismaGenerationJobRepository, PrismaLeadRepository, PrismaSmtpAccountRepository, PrismaUserRepository, PrismaWorkspace } from "@repo/infrastructure/repositories"
import { MailSender } from "../infrastructure/email/smtp/MailSender"
import { RedisCampaignQueue, RedisworkspaceLimitCounter } from "@repo/infrastructure/cache"


export const generationJobRepository=new PrismaGenerationJobRepository
export const leadRepository=new PrismaLeadRepository
export const workspaceRepository=new PrismaWorkspace
export const aiApiRepository=new PrismaAiApiRepository
export const aiProviderFactory =new AiProviderFactory
export const campaignRepository= new PrismaCampaignRepository
export const campaignEmailRepository=new PrismaCampaignEmailRepository
export const smtpAccountRepository=new PrismaSmtpAccountRepository
export const userRepository=new PrismaUserRepository
export const workspaceLimitCounter=new RedisworkspaceLimitCounter

export const emailSender=new MailSender

export const campaignqueue=new RedisCampaignQueue