import type { ICampaignEmailRepository, ICampaignRepository, ISmtpAccountRepository, IWorkspaceLimitCounter, } from "@repo/ports";
import { generateEmailTemplate } from "../../infrastructure/email/templates/campaign-email.template";
import type { IEmailSender } from "../Ports/iEmailSender-ports";
import { generatePlainText } from "../../infrastructure/email/templates/email.generatePlainText";
import { RandomHelper } from "../../utils/randomHelper";
import { campaignMailSendQueue, } from "@repo/queue";
import { PlanService } from "@repo/config";


export class MailSendUseCase {
    constructor(
        private readonly campaignEmailRepository: ICampaignEmailRepository,
        private readonly smtpAccountRepository: ISmtpAccountRepository,
        private readonly emailSender: IEmailSender,
        private readonly campaignRepository: ICampaignRepository,
        private readonly workspaceLimitCounter: IWorkspaceLimitCounter

    ) { }
    async execute(campaignId: string, minDelay: number, maxDelay: number) {


        const campaignContex = await this.campaignRepository.findCampaignContext(campaignId)
        const limit = PlanService.getLimits(campaignContex?.workspace?.subscription!)

        const mailsent = await this.workspaceLimitCounter.get(campaignContex?.workspaceId!, "mailSentDaily")


        if (mailsent >= limit.mailSentDaily) {
            const nextRun = campaignContex?.nextRunAt;
            const nextday = new Date(nextRun!.setDate(nextRun!.getDate() + 1))
            return this.campaignRepository.updateById(campaignId, {status:"SCHEDULED", nextRunAt: nextday ,  error: "You have reached your daily email sending limit"})
        }


        const mailData = await this.campaignEmailRepository.findFirst(campaignId, "PENDING")

        if (!mailData) {
            await this.campaignRepository.updateStatusByID(campaignId, "COMPLETED")
            return
        }


        const text = generatePlainText({
            greeting: mailData.greeting,
            body: mailData.body,
            signature: mailData.signature,
        });


        const emailTempelete = generateEmailTemplate(
            {
                greeting: mailData?.greeting!,
                body: mailData?.body!!,
                signature: mailData?.signature
            })


        const smtp = await this.smtpAccountRepository.findById(mailData?.smtpId!)

        if (!smtp) {
            this.campaignRepository.updateById(campaignId, { error: "Smtp acoount data not found" })
            return
        }


        await this.emailSender.send({ smtp: smtp, to: mailData.email, subject: mailData.subject, html: emailTempelete, text: text })



        await this.campaignEmailRepository.updateStatus(mailData.id, "SENT")

        const randomDealy = RandomHelper.randomDealy(minDelay, maxDelay) * 1000

        await campaignMailSendQueue.add(
            "mail-send",
            { campaignId: campaignId, minDelay: minDelay, maxDelay: maxDelay },
            {
                delay: randomDealy,
                jobId: `campaign-${campaignId}-${mailData.id}`,
                removeOnComplete: true,
                removeOnFail: true,
            }
        )

        await this.workspaceLimitCounter.increment(campaignContex?.workspaceId!, "mailSentDaily")

    }
}