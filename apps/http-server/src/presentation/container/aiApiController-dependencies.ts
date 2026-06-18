import { CreateAiAPiUseCase } from "../../application/use-cases/aiApi/createAiApi-useCase";
import { AiApiController } from "../controllers/AiApiController";
import { prismaAiApiRepository } from "./share-dependencies";
const createAiApiusecase=new CreateAiAPiUseCase(
    prismaAiApiRepository
)
export const aiApiController=new AiApiController(createAiApiusecase)