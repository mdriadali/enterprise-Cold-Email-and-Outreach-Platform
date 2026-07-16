import cron from "node-cron";
import type { ScheduleTodayCampaignUseCase } from "../../application/usecases/scheduleTodayCampaignUseCase";

export class CronCampaignMailScheduler {
    constructor(
        private readonly scheduleTodayCampaignUseCase: ScheduleTodayCampaignUseCase
    ) { }
    start() {
        console.log("campaign mail Scheduler Corn Started")
        cron.schedule("*/5 * * * * ", async () => {
            try {
                this.scheduleTodayCampaignUseCase.execute();
            } catch (error) {
                console.log(error)
            }

        });
        this.scheduleTodayCampaignUseCase.execute();
    }
}