import { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import { GetGenerationJobUseCase } from "../../application/use-cases/generationJob/getGenerationJob-useCase";
import { StartGenerationJobUseCase } from "../../application/use-cases/generationJob/startGenerationJob-usecase";
import { GenerationJobController } from "../controllers/generationJobController";
import { generationJobRepository, workspaceMemberRepository } from "./share-dependencies";

const creategenerationJobUseCase = new CreategenerationJobUseCase(
    workspaceMemberRepository,
    generationJobRepository
)

const startGenerationJobUseCase = new StartGenerationJobUseCase(
    generationJobRepository,
)

const getGenerationJobUseCase = new GetGenerationJobUseCase(
    generationJobRepository
)


export const generationJobController = new GenerationJobController(creategenerationJobUseCase, startGenerationJobUseCase, getGenerationJobUseCase)