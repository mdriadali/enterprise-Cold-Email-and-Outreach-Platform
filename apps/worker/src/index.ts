import { logger } from "./logger";
import { cronCampaignMailScheduler } from "./container/cronCampaignMailScheduler-dependencies";
import "./workers/generation.worker";
import "./workers/resetApiKeyStatus.worker";
import "./workers/mailsend.worker";
import "./workers/emailSending.worker";

export { logger };

logger.info("Worker application started");

cronCampaignMailScheduler.start();