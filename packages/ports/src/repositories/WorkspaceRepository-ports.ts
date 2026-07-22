import type { Subscription, Workspace } from "@repo/db";

export interface IWorkspaceRepository{
    create(userId:string,name:string,subscription:Subscription):Promise<Workspace>,
    findById(id:string):Promise<Workspace |null>
    info(workspaceId:string):Promise<Workspace|null>
}