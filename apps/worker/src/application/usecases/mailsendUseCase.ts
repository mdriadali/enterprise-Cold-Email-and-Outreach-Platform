import type { ICampaignEmailRepository, ICampaignqueue, ICampaignRepository, ISmtpAccountRepository, IWorkspaceLimitCounter, } from "@repo/ports";
import { generateEmailTemplate } from "../../infrastructure/email/templates/campaign-email.template";
import type { IEmailSender } from "../Ports/iEmailSender-ports";
import { generatePlainText } from "../../infrastructure/email/templates/email.generatePlainText";
import { RandomHelper } from "../../utils/randomHelper";
import { campaignMailSendQueue, } from "@repo/queue";
import { PlanService } from "@repo/config";
import { SmtpError } from "../../infrastructure/email/smtp/SmtpError";
import { logger } from "../../logger";


export class MailSendUseCase {
    constructor(
        private readonly campaignEmailRepository: ICampaignEmailRepository,
        private readonly smtpAccountRepository: ISmtpAccountRepository,
        private readonly emailSender: IEmailSender,
        private readonly campaignRepository: ICampaignRepository,
        private readonly workspaceLimitCounter: IWorkspaceLimitCounter,
        private readonly campaignqueue:ICampaignqueue

    ) { }
    async execute(campaignId: string, minDelay: number, maxDelay: number) {


        const campaignContex = await this.campaignRepository.findCampaignContext(campaignId)
        const limit = PlanService.getLimits(campaignContex?.workspace?.subscription!)

        const mailsent = await this.workspaceLimitCounter.get(campaignContex?.workspaceId!, "mailSentDaily")


        if (mailsent >= limit.mailSentDaily) {
            const nextRun = campaignContex?.nextRunAt;
            const nextday = new Date(nextRun!.setDate(nextRun!.getDate() + 1))
            return this.campaignRepository.updateById(campaignId, { status: "SCHEDULED", nextRunAt: nextday, error: "You have reached your daily email sending limit" })
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


        let sendSucceeded = false;

        try {
            await this.emailSender.send({ smtp: smtp, to: mailData.email, subject: mailData.subject, html: emailTempelete, text: text })
            sendSucceeded = true;
        } catch (err) {
            if (err instanceof SmtpError) {
                const errorMessage = err.message;

                await this.campaignEmailRepository.updateError(mailData.id, errorMessage)

                logger.error({ campaignId, emailId: mailData.id, code: err.code, message: err.message }, "SMTP error");

                if (err.code === "RATE_LIMIT" || err.code === "DAILY_LIMIT") {
                    const nextRun = campaignContex?.nextRunAt ?? new Date();
                    const rescheduleAt = new Date(nextRun);
                    rescheduleAt.setDate(rescheduleAt.getDate() + 1);

                    await this.campaignRepository.updateById(campaignId, {
                        status: "SCHEDULED",
                        nextRunAt: rescheduleAt,
                        error: `Campaign paused due to SMTP ${err.code === "RATE_LIMIT" ? "rate limit" : "daily limit"}. Rescheduled for ${rescheduleAt.toISOString()}. Detail: ${errorMessage}`,
                    });

                    logger.warn({ campaignId, code: err.code, retryAt: rescheduleAt.toISOString() }, "Campaign paused");
                    return;
                }

                if (err.code === "AUTH_FAILED") {
                    await this.campaignRepository.updateById(campaignId, {
                        status: "PAUSED",
                        error: `Campaign paused: SMTP authentication failed for account "${smtp.username}" on host "${smtp.host}". Please verify your SMTP credentials. Detail: ${errorMessage}`,
                    });

                    logger.warn({ campaignId }, "Campaign paused due to AUTH_FAILED");
                    return;
                }

                if (err.code === "CONNECTION") {
                    await this.campaignRepository.updateById(campaignId, {
                        status: "PAUSED",
                        error: `Campaign paused: Cannot connect to SMTP host "${smtp.host}:${smtp.port}". Check your SMTP settings or server status. Detail: ${errorMessage}`,
                    });

                    logger.warn({ campaignId }, "Campaign paused due to CONNECTION error");
                    return;
                }

                if (err.code === "REJECTED") {
                    logger.warn({ campaignId, emailId: mailData.id, email: mailData.email }, "Email permanently rejected, skipping");
                }

                await this.campaignRepository.updateById(campaignId, {
                    error: `Last email failed [${err.code}]: ${errorMessage}`,
                });

            } else {
                const message = err instanceof Error ? err.message : String(err)
                await this.campaignEmailRepository.updateError(mailData.id, `Unexpected error: ${message}`)
                await this.campaignRepository.updateById(campaignId, {
                    status: "PAUSED",
                    error: `Campaign paused due to an unexpected error: ${message}`,
                })
                logger.error({ campaignId, err }, "Unexpected error");
                return;
            }
        }

        if (sendSucceeded) {
            await this.campaignEmailRepository.updateStatus(mailData.id, "SENT")
            await this.workspaceLimitCounter.increment(campaignContex?.workspaceId!, "mailSentDaily")
        }

        const randomDealy = RandomHelper.randomDealy(minDelay, maxDelay) * 1000

        await this.campaignqueue.addMailSendQueue(campaignId,randomDealy,minDelay,maxDelay)

    }
}
