import { CreateSmtpAccountuseCase } from "../../application/use-cases/smtp/createSmtpAccount-usecase";
import { FindAllSmtpAccountUseCase } from "../../application/use-cases/smtp/findAllSmtpAccount-useCase";
import { UpdateSmtpAccountUseCase } from "../../application/use-cases/smtp/updateSmtpAccount-useCase";
import { SmtpAccountController } from "../controllers/smtpController";
import { smtpAccountRepository, workspaceRepository } from "./share-dependencies";

const createSmtpAccountuseCase=new CreateSmtpAccountuseCase(
    smtpAccountRepository,
    workspaceRepository
)
const findAllSmtpAccountUseCase=new FindAllSmtpAccountUseCase(
    smtpAccountRepository
)
const updateSmtpAccountUseCase=new UpdateSmtpAccountUseCase(workspaceRepository,smtpAccountRepository)

export const smtpAccountController=new SmtpAccountController(createSmtpAccountuseCase,findAllSmtpAccountUseCase,updateSmtpAccountUseCase)