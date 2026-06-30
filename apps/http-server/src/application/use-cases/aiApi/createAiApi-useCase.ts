import type { AiProvider } from "@repo/db";
import { AiApiValidator } from "../../../domain/aiApi/aiapivalidator";
import type { IAiApiRepository } from "@repo/ports";


export class CreateAiAPiUseCase {
    constructor(
        private readonly aiApiRepository: IAiApiRepository
    ) { }
    async execute(userId: string, workspaceId: string, provider: AiProvider, apiKey: string) {
        AiApiValidator.createInput(provider, apiKey)
        const newApi = await this.aiApiRepository.create(userId, workspaceId, provider, apiKey)
        return newApi
    }
}