import { CreategenerationJobUseCase } from "../../application/use-cases/generationJob/createGenerationJob-useCase";
import { GenerationJobController } from "../controllers/generationJobController";
import { generationJobRepository, workspaceMemberRepository } from "./share-dependencies";

const creategenerationJobUseCase=new CreategenerationJobUseCase(
workspaceMemberRepository,
generationJobRepository
)

export const generationJobController=new GenerationJobController(creategenerationJobUseCase)