import type { AiProvider } from "@repo/db";
import { AiApiValidator } from "../../../domain/aiApi/aiapivalidator";
import type { IAiApiRepository } from "../../ports/repositories/AiApiRepository-ports";

export class CreateAiAPiUseCase {
    constructor(
        private readonly aiApiRepository:IAiApiRepository
    ) { }
    async execute(userId:string,provider: AiProvider, apiKey: string) {
        AiApiValidator.createInput(provider, apiKey)
        const newApi=await this.aiApiRepository.create(userId,provider,apiKey)
        return newApi
    }
}