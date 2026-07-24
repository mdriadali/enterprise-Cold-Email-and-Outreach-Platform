import { CreateAiAPiUseCase } from "../../application/use-cases/aiApi/createAiApi-useCase";
import { AiApiController } from "../controllers/AiApiController";
import { prismaAiApiRepository, workspaceRepository } from "./share-dependencies";
const createAiApiusecase=new CreateAiAPiUseCase(
    prismaAiApiRepository,
    workspaceRepository
)
export const aiApiController=new AiApiController(createAiApiusecase)