import type { workspaceData, workspaceInfoData } from "@repo/types";

export interface IWorkspaceRepository{
    create(userId:string,name:string):Promise<workspaceData>,
    findById(id:string):Promise<workspaceData |null>
    info(workspaceId:string):Promise<workspaceInfoData|null>
}