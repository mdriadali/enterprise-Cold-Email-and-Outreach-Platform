import type { workspaceData } from "@repo/types";

export interface IWorkspaceRepository{
    create(userId:string,name:string):Promise<workspaceData>
}