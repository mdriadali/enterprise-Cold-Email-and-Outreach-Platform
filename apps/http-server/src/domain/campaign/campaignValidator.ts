import type { CreateCampaignInput, LeadEmailData } from "@repo/types";
import { CampaignError } from "./campaignError";

export class CampaignValidator {
    static validateInputemailSource(generationId?: string, emails?: LeadEmailData[]) {
        if (generationId && emails?.length) {
            throw new CampaignError("Provide either generationJobId or emails, not both.")
        }
        if (!generationId && !emails?.length) {
            throw new CampaignError("Either generationJobId or emails is required.")
        }
    }
    static validateEmailData(emailsData: LeadEmailData[]) {
        if (emailsData.length === 0) {
            throw new CampaignError("No email data found.");
        }
        emailsData.map(email => {
            if (!email.email) {
                throw new CampaignError("Email is required In Email Data.")
            }
            if (!email.subject) {
                throw new CampaignError("Subject is required In Email Data.")
            }
            if (!email.greeting) {
                throw new CampaignError("Greeting is required In Email Data.")
            }
            if (!email.body) {
                throw new CampaignError("Body is required In Email Data.")
            }
            if (!email.signature) {
                throw new CampaignError("Signature is required In Email Data.")
            }
        })
    }
}