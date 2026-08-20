import type { User } from "@repo/db";
import type { CreatedUserData,  RegisterUserInput,  UpdateUserDto,  Userdata } from "@repo/types";

export interface IUserRepository {
    create(data: RegisterUserInput): Promise<CreatedUserData>;
    findByEmail(email: string): Promise<User|null>
    findById(id:string):Promise<User|null>
    updateById(id:string,data:UpdateUserDto):Promise <User>
    decrementFreeWorkspaceQuota(id:string):Promise<User>
    markEmailVerified(email: string): Promise<void>
}