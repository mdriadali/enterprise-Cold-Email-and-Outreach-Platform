import type { CreatedUserData,  RegisterUserInput,  UpdateUserDto,  Userdata } from "@repo/types";

export interface IUserRepository {
    create(data: RegisterUserInput): Promise<CreatedUserData>;
    findByEmail(email: string): Promise<Userdata|null>
    findById(id:string):Promise<Userdata|null>
    updateById(id:string,data:UpdateUserDto):Promise <Userdata>
}