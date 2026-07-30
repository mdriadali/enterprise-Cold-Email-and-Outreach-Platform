import { AllCampaignEmailUseCase } from "../../application/use-cases/campaignEmail/allCampaignEmail-useCase";
import { CampaignEmailController } from "../controllers/campaignEmailController";
import { campaignEmailRepository } from "./share-dependencies";

const allCampaignEmailUseCase = new AllCampaignEmailUseCase(campaignEmailRepository)
export const campaignEmailController = new CampaignEmailController(allCampaignEmailUseCase)