import type { workspaceMemberCreateData, workspaceMemberData } from "@repo/types";

export interface IWorkspaceMemberRepository{
    create(data:workspaceMemberCreateData):Promise<workspaceMemberData>
    findByWorkspaceAndUser(workspaceId:string,UserId:string):Promise<workspaceMemberData |null>
    delete(workspaceId:string, memberId:string):Promise<workspaceMemberData|null>
}