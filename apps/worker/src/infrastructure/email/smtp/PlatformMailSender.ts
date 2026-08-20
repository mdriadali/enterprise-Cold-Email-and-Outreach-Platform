import nodemailer from "nodemailer";
import { workerEnv } from "@repo/env/worker-env";
import type { IAuthEmailSender } from "../../../application/Ports/iAuthEmailSender-ports";

export class PlatformMailSender implements IAuthEmailSender {
    async send(options: { to: string; subject: string; html: string; text: string; }): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: workerEnv.SMTP_HOST,
            port: Number(workerEnv.SMTP_PORT),
            secure: workerEnv.SMTP_ENCRYPTION === "ssl",
            requireTLS: workerEnv.SMTP_ENCRYPTION === "tls",
            auth: {
                user: workerEnv.SMTP_USER,
                pass: workerEnv.SMTP_PASS,
            },
        });

        try {
            const send = await transporter.sendMail({
                from: workerEnv.MAIL_FROM,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            console.log("[PlatformMailSender] Mail sent successfully:", {
                messageId: send.messageId,
                to: options.to,
                subject: options.subject,
            });
        } catch (err) {
            console.error("[PlatformMailSender] Send failed:", {
                to: options.to,
                host: workerEnv.SMTP_HOST,
                rawError: err,
            });
            throw err;
        }
    }
}
