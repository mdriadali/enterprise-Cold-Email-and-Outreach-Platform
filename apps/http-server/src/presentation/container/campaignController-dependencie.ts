import { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import { SchudleCampaignUseCase } from "../../application/use-cases/campaign/scheduleCampaignUseCase";
import { UpdateCampaignStatusUseCase } from "../../application/use-cases/campaign/updateCampaignStatus-useCase";
import { CampaignController } from "../controllers/CampaignController";
import { campaignEmailRepository, campaignRepository, leadRepository } from "./share-dependencies";

const createCampignUseCase=new CreateCampignUseCase(
    leadRepository,
    campaignRepository,
    campaignEmailRepository
)


const schudleCampaignUseCase=new SchudleCampaignUseCase(campaignRepository,campaignEmailRepository)
const updateCampaignStatusUseCase=new UpdateCampaignStatusUseCase(
schudleCampaignUseCase
)

export const campaignController=new CampaignController(createCampignUseCase,updateCampaignStatusUseCase)