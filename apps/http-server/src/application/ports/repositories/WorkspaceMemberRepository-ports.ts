import type { workspaceMemberCreateData, workspaceMemberData } from "@repo/types";

export interface IWorkspaceMemberRepository{
    create(data:workspaceMemberCreateData):Promise<workspaceMemberData>
}