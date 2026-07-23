import { CanceledcampaignuseCase } from "../../application/use-cases/campaign/canceledCampaign-useCase";
import { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import { DraftCampiagnUseCase } from "../../application/use-cases/campaign/draftcampaign-useCase";
import { PausedCampaignUseCase } from "../../application/use-cases/campaign/pausedcampaign-usecase";
import { SchudleCampaignUseCase } from "../../application/use-cases/campaign/scheduleCampaignUseCase";
import { UpdateCampaignUseCase } from "../../application/use-cases/campaign/updateCampaign-useCase";
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
const draftCampiagnUseCase=new DraftCampiagnUseCase(campaignRepository)

const updateCampaignStatusUseCase=new UpdateCampaignStatusUseCase(
schudleCampaignUseCase,
pausedCampaignUseCase,
canceledcampaignuseCase,
draftCampiagnUseCase

)


const updateCampaignUseCase=new UpdateCampaignUseCase(campaignRepository)

export const campaignController=new CampaignController(createCampignUseCase,updateCampaignStatusUseCase,updateCampaignUseCase)