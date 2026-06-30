import type { aiApiStatus, AiProvider } from "@repo/db";
import type { aiApiData, ApiSummary } from "@repo/types";

export interface IAiApiRepository{
    create(ownerId:string,workspaceid:string,provider:AiProvider,key:string):Promise<aiApiData>
    findByOwnerId(ownerId:string):Promise<aiApiData[]>
    getApiSummary(ownerId:string):Promise<ApiSummary>;
    updateStatus(id:string , status:aiApiStatus):Promise<aiApiData>
    findAvailableByOwnerId(ownerId:string):Promise<aiApiData[]>
}