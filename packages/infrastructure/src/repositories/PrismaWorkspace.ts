import type { workspaceData } from "@repo/types";
import { prismaClient } from "@repo/db";
import type { IWorkspaceRepository } from "@repo/ports";

export class PrismaWorkspace implements IWorkspaceRepository {
  async create(userId: string, name: string): Promise<workspaceData> {
    const createWorkspace = await prismaClient.workspace.create({
      data: {
        name,
        ownerId: userId
      }
    })

    return {
      id: createWorkspace.id,
      name: createWorkspace.name,
      ownerId: createWorkspace.ownerId
    }
  }

  async findById(id: string): Promise<workspaceData | null> {
   const workspace=await prismaClient.workspace.findUnique({
      where:{
        id
      }
    })
     if(!workspace){
      return null
     }
     return workspace
  }
}