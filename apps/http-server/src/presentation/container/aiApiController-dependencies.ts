import { CreateAiAPiUseCase } from "../../application/use-cases/aiApi/createAiApi-useCase";
import { FindAiAPIUseCase } from "../../application/use-cases/aiApi/findAiApi-useCase";
import { UpdateAiApiUseCase } from "../../application/use-cases/aiApi/updateAiApi-useCase";
import { DeleteAiApiUseCase } from "../../application/use-cases/aiApi/deleteAiApi-useCase";
import { AiApiController } from "../controllers/AiApiController";
import { prismaAiApiRepository, workspaceRepository } from "./share-dependencies";
const createAiApiusecase=new CreateAiAPiUseCase(
    prismaAiApiRepository,
    workspaceRepository
)
const findAiAPIUseCase=new FindAiAPIUseCase(
    prismaAiApiRepository
)
const updateAiApiUseCase=new UpdateAiApiUseCase(
    workspaceRepository,
    prismaAiApiRepository
)
const deleteAiApiUseCase=new DeleteAiApiUseCase(
    workspaceRepository,
    prismaAiApiRepository
)
export const aiApiController=new AiApiController(createAiApiusecase, findAiAPIUseCase, updateAiApiUseCase, deleteAiApiUseCase)