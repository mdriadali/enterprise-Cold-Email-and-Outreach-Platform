import { AppError } from "../AppError";

export class CampaignError extends AppError{
    constructor(message:string){
        super(message)
    }
}