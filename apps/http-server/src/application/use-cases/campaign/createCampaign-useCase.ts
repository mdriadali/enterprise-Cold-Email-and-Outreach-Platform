import type { ICampaignEmailRepository, ICampaignRepository, ILeadRepository } from "@repo/ports";
import type { CreateCampaignInput } from "@repo/types";
import { CampaignValidator } from "../../../domain/campaign/campaignValidator";
import { DateHelper } from "@repo/common"

export class CreateCampignUseCase {
    constructor(
        private readonly leadRepository: ILeadRepository,
        private readonly campaignRepository: ICampaignRepository,
        private readonly campaignEmailRepository: ICampaignEmailRepository
    ) { }
    async execute(inputData: CreateCampaignInput) {
        CampaignValidator.validateCreateInput(inputData)
        let emailsData = []
        if (inputData.generationJobId) {
            const emails = await this.leadRepository.findAllEmailData(inputData.generationJobId, inputData.workspaceId)
            emailsData = emails
        } else {
            emailsData = inputData.emails ?? []
        }

        CampaignValidator.validateEmailData(emailsData)
        inputData.emails = emailsData

        const nextrun=DateHelper.getUtcDateTime(inputData.startAt,inputData.sendingFromHour,inputData.timezone)

        const createCampaign = await this.campaignRepository.create({
            ...inputData,
            startAt: DateHelper.toUtcDate(inputData.startAt, inputData.timezone).toISOString(),
            endAt: DateHelper.toUtcDate(inputData.endAt, inputData.timezone).toISOString(),
            nextRunAt:nextrun
        })

        await this.campaignEmailRepository.createMany(
            emailsData.map(emailData => ({
                campaignId: createCampaign.id,
                email: emailData.email,
                subject: emailData.subject,
                greeting: emailData.greeting,
                body: emailData.body,
                signature: emailData.signature,
                smtpId: inputData.smtpAccountId,
            }))
        )

        return createCampaign



    }


}