import { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import { CampaignController } from "../controllers/CampaignController";
import { campaignEmailRepository, campaignRepository, leadRepository } from "./share-dependencies";

const createCampignUseCase=new CreateCampignUseCase(
    leadRepository,
    campaignRepository,
    campaignEmailRepository
)

export const campaignController=new CampaignController(createCampignUseCase)