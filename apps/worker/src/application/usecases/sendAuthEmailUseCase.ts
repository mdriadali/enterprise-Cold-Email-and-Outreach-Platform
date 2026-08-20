import type { AuthEmailJobData } from "@repo/types";
import type { IAuthEmailSender } from "../Ports/iAuthEmailSender-ports";
import { generateForgotPasswordEmailTemplate, generateForgotPasswordPlainText } from "../../infrastructure/email/templates/forgot-password-email.template";
import { generateVerificationEmailTemplate, generateVerificationPlainText } from "../../infrastructure/email/templates/verification-email.template";

export class SendAuthEmailUseCase {
    constructor(private readonly emailSender: IAuthEmailSender) { }

    async execute(data: AuthEmailJobData): Promise<void> {
        if (data.type === "verify-email") {
            await this.emailSender.send({
                to: data.email,
                subject: "Verify your email",
                html: generateVerificationEmailTemplate({ name: data.name, link: data.link, expiresInMinutes: data.expiresInMinutes }),
                text: generateVerificationPlainText({ name: data.name, link: data.link, expiresInMinutes: data.expiresInMinutes }),
            });
            return;
        }

        if (data.type === "forgot-password") {
            await this.emailSender.send({
                to: data.email,
                subject: "Reset your password",
                html: generateForgotPasswordEmailTemplate({ name: data.name, link: data.link, expiresInMinutes: data.expiresInMinutes }),
                text: generateForgotPasswordPlainText({ name: data.name, link: data.link, expiresInMinutes: data.expiresInMinutes }),
            });
            return;
        }
    }
}
