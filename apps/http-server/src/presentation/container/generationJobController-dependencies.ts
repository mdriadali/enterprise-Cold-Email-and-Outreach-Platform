import { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import { GetGenerationJobUseCase } from "../../application/use-cases/generationJob/getGenerationJob-useCase";
import { FindGenerationJobsUseCase } from "../../application/use-cases/generationJob/findGenerationJobs-useCase";
import { UpdateGenerationJobUseCase } from "../../application/use-cases/generationJob/updateGenerationJob-useCase";
import { DeleteGenerationJobUseCase } from "../../application/use-cases/generationJob/deleteGenerationJob-useCase";
import { StartGenerationJobUseCase } from "../../application/use-cases/generationJob/startGenerationJob-usecase";
import { GenerationJobController } from "../controllers/generationJobController";
import { generationJobRepository, leadRepository, workspaceRepository } from "./share-dependencies";

const creategenerationJobUseCase = new CreategenerationJobUseCase(
    workspaceRepository,
    generationJobRepository
)

const startGenerationJobUseCase = new StartGenerationJobUseCase(
    generationJobRepository,
)

const getGenerationJobUseCase = new GetGenerationJobUseCase(
    generationJobRepository
)

const findGenerationJobsUseCase = new FindGenerationJobsUseCase(
    generationJobRepository
)

const updateGenerationJobUseCase = new UpdateGenerationJobUseCase(
    generationJobRepository
)

const deleteGenerationJobUseCase = new DeleteGenerationJobUseCase(
    workspaceRepository,
    generationJobRepository,
    leadRepository
)


export const generationJobController = new GenerationJobController(creategenerationJobUseCase, startGenerationJobUseCase, getGenerationJobUseCase, findGenerationJobsUseCase, updateGenerationJobUseCase, deleteGenerationJobUseCase)