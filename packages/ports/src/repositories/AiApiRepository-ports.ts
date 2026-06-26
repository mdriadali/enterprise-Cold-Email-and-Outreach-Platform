import type { aiApiStatus, AiProvider } from "@repo/db";
import type { aiApiData } from "@repo/types";

export interface IAiApiRepository{
    create(ownerId:string,provider:AiProvider,key:string):Promise<aiApiData>
    findByOwnerId(ownerId:string):Promise<aiApiData[]>
    updateStatus(id:string , status:aiApiStatus):Promise<void>
    findAvailableByOwnerId(ownerId:string):Promise<aiApiData[]>
}