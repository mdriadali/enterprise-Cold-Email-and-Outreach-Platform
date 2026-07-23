import { MailSendUseCase } from "../application/usecases/mailsendUseCase";

import { campaignEmailRepository, campaignqueue, campaignRepository, emailSender, smtpAccountRepository, userRepository, workspaceLimitCounter } from "./dependencies";



export const mailSendUseCase = new MailSendUseCase(
    campaignEmailRepository,
    smtpAccountRepository,
    emailSender,
    campaignRepository,
    workspaceLimitCounter,
    campaignqueue
)