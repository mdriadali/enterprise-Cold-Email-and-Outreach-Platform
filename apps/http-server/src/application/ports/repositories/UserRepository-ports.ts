import type { CreatedUserData, RegisterUserInput, Userdata } from "@repo/types";

export interface IUserRepository {
    create(data: RegisterUserInput): Promise<CreatedUserData>;
    findByEmail(email: string): Promise<Userdata|null>
}