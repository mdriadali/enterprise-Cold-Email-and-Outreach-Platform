import { PlatformMailSender } from "../infrastructure/email/smtp/PlatformMailSender";
import { SendAuthEmailUseCase } from "../application/usecases/sendAuthEmailUseCase";

export const platformMailSender = new PlatformMailSender;
export const sendAuthEmailUseCase = new SendAuthEmailUseCase(platformMailSender);
