export interface IAuthEmailSender {
  send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void>;
}
