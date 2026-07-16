import { cronCampaignMailScheduler } from "./container/cronCampaignMailScheduler-dependencies"
import "./workers/generation.worker"
import "./workers/resetApiKeyStatus.worker"




cronCampaignMailScheduler.start()