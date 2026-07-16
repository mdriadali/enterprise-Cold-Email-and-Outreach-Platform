import { Queue } from "bullmq";
import { queueConnection } from "./connection";

export const campaignScheduleQueue= new Queue("campaignSchedule",{
    connection:queueConnection as any
})

export const campaignMailSendQueue=new Queue("campaign-mail-send",{
    connection:queueConnection as any
})