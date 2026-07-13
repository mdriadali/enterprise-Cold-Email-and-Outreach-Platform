import type { CreateCampaignInput, LeadEmailData } from "@repo/types";
import { CampaignError } from "./campaignError";
import type { CampaignStatus } from "@repo/db";

export class CampaignValidator {
    static validateCreateInput(input: CreateCampaignInput): void {

        if (!input.workspaceId) throw new CampaignError("Workspace ID is required.");
        if (!input.name.trim()) throw new CampaignError("Campaign name is required.");
        if (!input.timezone) throw new CampaignError("Timezone is required.");
        if (!input.startAt) throw new CampaignError("Start date is required.");
        if (!input.endAt) throw new CampaignError("End date is required.");
        if (!input.createdById) throw new CampaignError("CreatedBy ID is required.");
        if (!input.smtpAccountId) throw new CampaignError("SMTP Account ID is required.");


        const hasGenerationJob =
            !!input.generationJobId && input.generationJobId.trim().length > 0;

        const hasEmails =
            Array.isArray(input.emails) && input.emails.length > 0;

        if (!hasGenerationJob && !hasEmails) {
            throw new CampaignError(
                "Either generationJobId or emails must be provided."
            );
        }

        if (hasGenerationJob && hasEmails) {
            throw new CampaignError(
                "Provide either generationJobId or emails, not both."
            );
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