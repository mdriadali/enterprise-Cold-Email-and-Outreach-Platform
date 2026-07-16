import type { CampaignData, CreateCampaignInput, LeadEmailData } from "@repo/types";
import { CampaignError } from "./campaignError";
import { CampaignStatus } from "@repo/db";
import { BadRequestError } from "../sharedError";

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
    static validateUpdateStatusInput(campaignId: string, status: CampaignStatus) {
        if (!campaignId) {
            throw new CampaignError("CampaignId Invalid")
        }
        if (!status) {
            throw new CampaignError("Status Invalid")
        }
    }

    static validateCampaignData(data: CampaignData | null) {
        if (!data) {
            throw new CampaignError("Campaign data not found")
        }
    }

    static canSchedule(campaign: CampaignData) {
        // Status check
        if (campaign.status !== CampaignStatus.DRAFT) {
            throw new BadRequestError(
                "Only draft campaigns can be scheduled."
            );
        }

        // Required fields
        if (!campaign.smtpAccountId) {
            throw new BadRequestError("SMTP account is required.");
        }

        if (!campaign.startAt) {
            throw new BadRequestError("Start date is required.");
        }

        if (!campaign.timezone) {
            throw new BadRequestError("Timezone is required.");
        }

        // Date validation
        const now = new Date();

        if (campaign.startAt < now) {
            throw new BadRequestError(
                "Start date cannot be in the past."
            );
        }

        if (campaign.endAt && campaign.endAt <= campaign.startAt) {
            throw new BadRequestError(
                "End date must be after start date."
            );
        }

        // Sending rules
        if (
            campaign.sendingFromHour &&
            campaign.sendingToHour &&
            campaign.sendingFromHour >= campaign.sendingToHour
        ) {
            throw new BadRequestError(
                "Sending window is invalid."
            );
        }
    }

    static isemailsExist(count: number) {
        if (count <= 0) {
            throw new BadRequestError("Campaign must contain at least one email.")
        }
    }
}