import { cronCampaignMailScheduler } from "./container/cronCampaignMailScheduler-dependencies"
import "./workers/generation.worker"
import "./workers/resetApiKeyStatus.worker"
import "./workers/mailsend.worker"
import "./workers/emailSending.worker"




cronCampaignMailScheduler.start()