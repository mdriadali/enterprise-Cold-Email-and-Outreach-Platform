import { ScheduleTodayCampaignUseCase } from "../application/usecases/scheduleTodayCampaignUseCase";
import { CronCampaignMailScheduler } from "../infrastructure/corn/CronCampaignMailScheduler";
import { campaignqueue, campaignRepository } from "./dependencies";

const scheduleTodayCampaignUseCase=new ScheduleTodayCampaignUseCase(campaignRepository,campaignqueue)
 export const cronCampaignMailScheduler= new CronCampaignMailScheduler(scheduleTodayCampaignUseCase)