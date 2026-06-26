import { AiProviderFactory } from "@repo/infrastructure/ai"
import { PrismaAiApiRepository, PrismaGenerationJobRepository, PrismaLeadRepository, PrismaWorkspace } from "@repo/infrastructure/repositories"


export const generationJobRepository=new PrismaGenerationJobRepository
export const leadRepository=new PrismaLeadRepository
export const workspaceRepository=new PrismaWorkspace
export const aiApiRepository=new PrismaAiApiRepository
export const aiProviderFactory =new AiProviderFactory