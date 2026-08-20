import type { CreatedUserData, RegisterUserInput, UpdateUserDto, Userdata } from "@repo/types";

import { prismaClient, type User } from "@repo/db";
import type { IUserRepository } from "@repo/ports";


export class PrismaUserRepository implements IUserRepository {


  async create(data: RegisterUserInput): Promise<CreatedUserData> {

    // user create now 
    const createUser = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password
      }
    }
    )
    // user data returend
    return {
      id: createUser.id,
      name: createUser.name,
      email: createUser.email,
    }

  }


  async findByEmail(email: string): Promise<User | null> {
    const findUser =
      await prismaClient.user.findUnique({
        where: {
          email
        }
      });

    if (!findUser) {
      return null;
    }

    return findUser
  }



  async findById(id: string): Promise<User | null> {
    const user = await prismaClient.user.findUnique({
      where: {
        id: id
      },
    })

    if (!user) {
      return null;
    }

    return user

  }

  async updateById(id: string, data: UpdateUserDto): Promise<User> {
    const updateUser = await prismaClient.user.update({
      where: {
        id
      },
      data,
    },
    )

    return updateUser
  }

  async decrementFreeWorkspaceQuota(id: string): Promise<User> {
    const decrement=await prismaClient.user.update({
      where:{
        id
      },
      data:{
        remainingFreeWorkspaces:{
          decrement:1
        }
      }
    })
    return decrement
  }

  async markEmailVerified(email: string): Promise<void> {
    await prismaClient.user.update({
      where: { email },
      data: { emailVerifiedAt: new Date() },
    })
  }




}