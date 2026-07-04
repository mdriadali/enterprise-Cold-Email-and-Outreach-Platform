import { CreateSmtpAccountuseCase } from "../../application/use-cases/smtp/createSmtpAccount-usecase";
import { FindAllSmtpAccountUseCase } from "../../application/use-cases/smtp/findAllSmtpAccount-useCase";
import { SmtpAccountController } from "../controllers/smtpController";
import { smtpAccountRepository } from "./share-dependencies";

const createSmtpAccountuseCase=new CreateSmtpAccountuseCase(
    smtpAccountRepository
)
const findAllSmtpAccountUseCase=new FindAllSmtpAccountUseCase(
    smtpAccountRepository
)
export const smtpAccountController=new SmtpAccountController(createSmtpAccountuseCase,findAllSmtpAccountUseCase)