import { CanceledcampaignuseCase } from "../../application/use-cases/campaign/canceledCampaign-useCase";
import { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import { PausedCampaignUseCase } from "../../application/use-cases/campaign/pausedcampaign-usecase";
import { SchudleCampaignUseCase } from "../../application/use-cases/campaign/scheduleCampaignUseCase";
import { UpdateCampaignStatusUseCase } from "../../application/use-cases/campaign/updateCampaignStatus-useCase";
import { CampaignController } from "../controllers/CampaignController";
import { campaignEmailRepository, campaignqueue, campaignRepository, leadRepository } from "./share-dependencies";

const createCampignUseCase=new CreateCampignUseCase(
    leadRepository,
    campaignRepository,
    campaignEmailRepository
)



const schudleCampaignUseCase=new SchudleCampaignUseCase(campaignRepository,campaignEmailRepository)
const pausedCampaignUseCase=new PausedCampaignUseCase(campaignRepository,campaignqueue)
const canceledcampaignuseCase=new CanceledcampaignuseCase(campaignRepository,campaignqueue,campaignEmailRepository)

const updateCampaignStatusUseCase=new UpdateCampaignStatusUseCase(
schudleCampaignUseCase,
pausedCampaignUseCase,
canceledcampaignuseCase

)

export const campaignController=new CampaignController(createCampignUseCase,updateCampaignStatusUseCase)