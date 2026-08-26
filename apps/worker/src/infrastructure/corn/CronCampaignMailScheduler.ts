import cron from "node-cron";

import type { ScheduleTodayCampaignUseCase } from "../../application/usecases/scheduleTodayCampaignUseCase";
import { logger } from "../../logger";


export class CronCampaignMailScheduler {
  private readonly cronLogger = logger.child({
    scheduler: "campaign-mail",
  });

  constructor(
    private readonly scheduleTodayCampaignUseCase: ScheduleTodayCampaignUseCase,
  ) {}

  start() {
    this.cronLogger.info("Campaign mail scheduler started");

    cron.schedule("*/5 * * * *", async () => {
      try {
        this.cronLogger.info("Campaign scheduler job started");

        await this.scheduleTodayCampaignUseCase.execute();

        this.cronLogger.info("Campaign scheduler job completed");
      } catch (error) {
        this.cronLogger.error(
          { err: error },
          "Campaign scheduler job failed",
        );
      }
    });

    // Run immediately when the worker starts
    this.scheduleTodayCampaignUseCase.execute().catch((error) => {
      this.cronLogger.error(
        { err: error },
        "Initial campaign scheduler execution failed",
      );
    });
  }
}