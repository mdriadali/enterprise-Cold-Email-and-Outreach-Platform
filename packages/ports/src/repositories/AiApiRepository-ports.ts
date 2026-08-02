import type { aiApiStatus, AiProvider } from "@repo/db";
import type { aiApiData, ApiSummary } from "@repo/types";

export interface IAiApiRepository{
    create(ownerId:string,workspaceid:string,provider:AiProvider,key:string):Promise<aiApiData>
    findByWorkspaceId(workspaceId:string):Promise<aiApiData[]>
    getApiSummary(workspaceId:string):Promise<ApiSummary>;
    updateStatus(id:string , status:aiApiStatus):Promise<aiApiData>
    findAvailableByWorkspaceId(workspaceId:string):Promise<aiApiData[]>
    updateByIdAndWorkspaceId(id:string, workspaceId:string, provider:AiProvider, key:string):Promise<aiApiData>
    delete(id:string, workspaceId:string):Promise<aiApiData>
}