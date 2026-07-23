import nodemailer from "nodemailer";
import type { SmtpAccount } from "@repo/db";
import type { IEmailSender } from "../../../application/Ports/iEmailSender-ports";
import { classifySmtpError } from "./SmtpError";


export class MailSender implements IEmailSender {
    async send(options: { smtp: SmtpAccount; to: string; subject: string; html: string; text: string; }): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: options.smtp.host,
            port: options.smtp.port,
            secure: options.smtp.encryption === "SSL",
            auth: {
                user: options.smtp.username,
                pass: options.smtp.password,
            },
        });

        try {
            const send = await transporter.sendMail({
                from: `"${options.smtp.fromName}" <${options.smtp.fromEmail}>`,
                // to: options.to,
                to: "mdriadali.official@gmail.com",
                replyTo: options.smtp.replyTo ?? undefined,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            console.log("[SMTP] Mail sent successfully:", {
                messageId: send.messageId,
                to: options.to,
                subject: options.subject,
                smtp: options.smtp.host,
            });
        } catch (err) {
            // Classify and rethrow as a structured SmtpError so the use-case
            // layer can make informed decisions (pause, skip, fail, etc.)
            const smtpError = classifySmtpError(err);

            console.error("[SMTP] Send failed:", {
                code: smtpError.code,
                message: smtpError.message,
                to: options.to,
                smtp: options.smtp.host,
                rawError: err,
            });

            throw smtpError;
        }
    }
}