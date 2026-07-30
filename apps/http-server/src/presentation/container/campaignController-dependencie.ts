import { CreateCampignUseCase } from "../../application/use-cases/campaign/createCampaign-useCase";
import { DeleteCampaignUseCase } from "../../application/use-cases/campaign/deleteCampaign-useCase";
import { DraftCampiagnUseCase } from "../../application/use-cases/campaign/draftcampaign-useCase";
import { FindCampaignuseCase } from "../../application/use-cases/campaign/findCampaign-useCase";
import { PausedCampaignUseCase } from "../../application/use-cases/campaign/pausedcampaign-usecase";
import { SchudleCampaignUseCase } from "../../application/use-cases/campaign/scheduleCampaignUseCase";
import { UpdateCampaignUseCase } from "../../application/use-cases/campaign/updateCampaign-useCase";
import { UpdateCampaignStatusUseCase } from "../../application/use-cases/campaign/updateCampaignStatus-useCase";
import { CampaignController } from "../controllers/CampaignController";
import { campaignEmailRepository, campaignqueue, campaignRepository, leadRepository, workspaceRepository } from "./share-dependencies";

const createCampignUseCase = new CreateCampignUseCase(
    leadRepository,
    campaignRepository,
    campaignEmailRepository,
    workspaceRepository
)

const findCampaignuseCase = new FindCampaignuseCase(
    campaignRepository
)



const schudleCampaignUseCase = new SchudleCampaignUseCase(campaignRepository, campaignEmailRepository)
const pausedCampaignUseCase = new PausedCampaignUseCase(campaignRepository, campaignqueue)
const draftCampiagnUseCase = new DraftCampiagnUseCase(campaignRepository)

const updateCampaignStatusUseCase = new UpdateCampaignStatusUseCase(
    schudleCampaignUseCase,
    pausedCampaignUseCase,
    draftCampiagnUseCase

)


const updateCampaignUseCase = new UpdateCampaignUseCase(campaignRepository)

const deleteCampaignUseCase = new DeleteCampaignUseCase(campaignRepository,campaignqueue,campaignEmailRepository)

export const campaignController = new CampaignController(createCampignUseCase, findCampaignuseCase, updateCampaignStatusUseCase, updateCampaignUseCase, deleteCampaignUseCase)