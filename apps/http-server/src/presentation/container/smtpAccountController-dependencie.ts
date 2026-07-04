import { CreateSmtpAccountuseCase } from "../../application/use-cases/smtp/createSmtpAccount-usecase";
import { SmtpAccountController } from "../controllers/smtpController";
import { smtpAccountRepository } from "./share-dependencies";

const createSmtpAccountuseCase=new CreateSmtpAccountuseCase(
    smtpAccountRepository
)
export const smtpAccountController=new SmtpAccountController(createSmtpAccountuseCase)