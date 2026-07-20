import type { SmtpAccount } from "@repo/db";

export interface IEmailSender {
  send(options: {
    smtp: SmtpAccount;
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void>;
}