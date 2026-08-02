import { maskApiKey } from "@repo/common";
import type { IAiApiRepository } from "@repo/ports";

export class FindAiAPIUseCase {
    constructor(
        private readonly aiApiRepository: IAiApiRepository
    ) { }
    async execute(workspaceId: string) {
        const apis = await this.aiApiRepository.findByWorkspaceId(workspaceId)
        const masked = apis.map((api) => ({ ...api, apiKey: maskApiKey(api.apiKey) }))
        const summary = await this.aiApiRepository.getApiSummary(workspaceId)
        return { apis: masked, summary }
    }
}