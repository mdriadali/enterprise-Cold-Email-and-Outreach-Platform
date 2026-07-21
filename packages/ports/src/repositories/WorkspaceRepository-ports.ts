import type { Subscription, Workspace } from "@repo/db";
import type {  workspaceInfoData } from "@repo/types";

export interface IWorkspaceRepository{
    create(userId:string,name:string,subscription:Subscription):Promise<Workspace>,
    findById(id:string):Promise<Workspace |null>
    info(workspaceId:string):Promise<workspaceInfoData|null>
}