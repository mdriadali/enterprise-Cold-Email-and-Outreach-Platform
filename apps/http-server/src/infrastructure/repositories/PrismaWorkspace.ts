import type { workspaceData } from "@repo/types";
import type { IWorkspaceRepository } from "../../application/ports/repositories/WorkspaceRepository-ports";
import { prismaClient } from "@repo/db";

export class PrismaWorkspace implements IWorkspaceRepository{
    async create(userId: string, name: string): Promise<workspaceData> {
      const   createWorkspace=await prismaClient.workspace.create({
        data:{
            name,
            ownerId:userId
        }
      })

      return {
        id:createWorkspace.id,
        name:createWorkspace.name,
        ownerId:createWorkspace.ownerId
      }
    }
}