import type { CreatedUserData, RegisterUserInput, UpdateUserDto, Userdata } from "@repo/types";

import { prismaClient } from "@repo/db";
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


  async findByEmail(email: string): Promise<Userdata | null> {
    const findUser =
      await prismaClient.user.findUnique({
        where: {
          email
        }
      });

    if (!findUser) {
      return null;
    }

    return {
      id: findUser.id,
      name: findUser?.name,
      email: findUser?.email,
      password: findUser?.password,
      role: findUser?.role,
    }
  }



  async findById(id: string): Promise<Userdata | null> {
    const user = await prismaClient.user.findUnique({
      where: {
        id: id
      }
    })

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user?.name,
      email: user?.email,
      password: user?.password,
      role: user?.role,
    }

  }

  async updateById(id: string, data: UpdateUserDto): Promise<Userdata> {
    const updateUser = await prismaClient.user.update({
      where: {
        id
      },
      data,
    },
    )

    return updateUser
  }




}