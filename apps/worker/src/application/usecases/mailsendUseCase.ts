import type { ICampaignEmailRepository, ICampaignRepository, ISmtpAccountRepository, IWorkspaceLimitCounter, } from "@repo/ports";
import { generateEmailTemplate } from "../../infrastructure/email/templates/campaign-email.template";
import type { IEmailSender } from "../Ports/iEmailSender-ports";
import { generatePlainText } from "../../infrastructure/email/templates/email.generatePlainText";
import { RandomHelper } from "../../utils/randomHelper";
import { campaignMailSendQueue, } from "@repo/queue";
import { PlanService } from "@repo/config";
import { SmtpError } from "../../infrastructure/email/smtp/SmtpError";


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

                // Always persist the error reason on the specific email record
                await this.campaignEmailRepository.updateError(mailData.id, errorMessage)

                console.error(`[MailSendUseCase] SMTP error for campaign=${campaignId} email=${mailData.id}:`, {
                    code: err.code,
                    message: err.message,
                })

                // ── Decision by error type ────────────────────────────────────────
                if (err.code === "RATE_LIMIT" || err.code === "DAILY_LIMIT") {
                    // Pause campaign and reschedule for the next day
                    const nextRun = campaignContex?.nextRunAt ?? new Date();
                    const rescheduleAt = new Date(nextRun);
                    rescheduleAt.setDate(rescheduleAt.getDate() + 1);

                    await this.campaignRepository.updateById(campaignId, {
                        status: "SCHEDULED",
                        nextRunAt: rescheduleAt,
                        error: `Campaign paused due to SMTP ${err.code === "RATE_LIMIT" ? "rate limit" : "daily limit"}. Rescheduled for ${rescheduleAt.toISOString()}. Detail: ${errorMessage}`,
                    });

                    console.warn(`[MailSendUseCase] Campaign ${campaignId} paused due to ${err.code}. Will retry at ${rescheduleAt.toISOString()}`)
                    return; // stop processing — do NOT re-queue
                }

                if (err.code === "AUTH_FAILED") {
                    // Fatal – bad credentials; pause the campaign so the user can fix it
                    await this.campaignRepository.updateById(campaignId, {
                        status: "PAUSED",
                        error: `Campaign paused: SMTP authentication failed for account "${smtp.username}" on host "${smtp.host}". Please verify your SMTP credentials. Detail: ${errorMessage}`,
                    });

                    console.error(`[MailSendUseCase] Campaign ${campaignId} PAUSED due to AUTH_FAILED`)
                    return;
                }

                if (err.code === "CONNECTION") {
                    // Transient – pause campaign so the user is alerted
                    await this.campaignRepository.updateById(campaignId, {
                        status: "PAUSED",
                        error: `Campaign paused: Cannot connect to SMTP host "${smtp.host}:${smtp.port}". Check your SMTP settings or server status. Detail: ${errorMessage}`,
                    });

                    console.error(`[MailSendUseCase] Campaign ${campaignId} PAUSED due to CONNECTION error`)
                    return;
                }

                if (err.code === "REJECTED") {
                    // Permanent recipient failure – skip this email but continue campaign
                    console.warn(`[MailSendUseCase] Email ${mailData.id} permanently rejected (${mailData.email}), skipping and continuing campaign`)
                    // email already marked FAILED via updateError above — fall through to re-queue
                }

                // UNKNOWN / REJECTED: log on campaign but continue sending to remaining emails
                await this.campaignRepository.updateById(campaignId, {
                    error: `Last email failed [${err.code}]: ${errorMessage}`,
                });

            } else {
                // Non-SMTP unexpected error — pause campaign
                const message = err instanceof Error ? err.message : String(err)
                await this.campaignEmailRepository.updateError(mailData.id, `Unexpected error: ${message}`)
                await this.campaignRepository.updateById(campaignId, {
                    status: "PAUSED",
                    error: `Campaign paused due to an unexpected error: ${message}`,
                })
                console.error(`[MailSendUseCase] Unexpected error for campaign=${campaignId}:`, err)
                return;
            }
        }

        // ── Mark email as SENT only when the SMTP call actually succeeded ──
        if (sendSucceeded) {
            await this.campaignEmailRepository.updateStatus(mailData.id, "SENT")
            await this.workspaceLimitCounter.increment(campaignContex?.workspaceId!, "mailSentDaily")
        }

        // Re-queue to process the next email in the campaign
        // (for REJECTED / UNKNOWN errors we still continue; for fatal errors we returned early above)
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

    }
}