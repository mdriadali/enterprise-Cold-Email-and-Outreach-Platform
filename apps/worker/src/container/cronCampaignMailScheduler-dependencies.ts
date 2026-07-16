import { ScheduleTodayCampaignUseCase } from "../application/usecases/scheduleTodayCampaignUseCase";
import { CronCampaignMailScheduler } from "../infrastructure/corn/CronCampaignMailScheduler";
import { campaignRepository } from "./dependencies";

const scheduleTodayCampaignUseCase=new ScheduleTodayCampaignUseCase(campaignRepository)
 export const cronCampaignMailScheduler= new CronCampaignMailScheduler(scheduleTodayCampaignUseCase)