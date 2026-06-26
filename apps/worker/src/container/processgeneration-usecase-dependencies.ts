
import { ProcessGenerationUseCase } from "../application/usecases/ProcessGenerationJobUseCase";
import { aiApiRepository, aiProviderFactory, generationJobRepository, leadRepository, workspaceRepository } from "./dependencies";

export const prosessGenerationUseCase=new ProcessGenerationUseCase(
    generationJobRepository,
    leadRepository,
    workspaceRepository,
    aiApiRepository,
    aiProviderFactory
)
