import { CreateLeadUseCase } from "../../application/use-cases/lead/createLead-useCase";
import { LeadController } from "../controllers/LeadController";
import { generationJobRepository, leadRepository } from "./share-dependencies";

const createLeadUseCase=new CreateLeadUseCase(
    generationJobRepository,
    leadRepository
)
export const leadController= new LeadController(createLeadUseCase)