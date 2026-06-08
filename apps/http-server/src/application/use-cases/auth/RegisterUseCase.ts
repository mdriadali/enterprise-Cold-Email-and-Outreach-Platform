import type { RegisterUserInput } from "@repo/types";
import { User } from "../../../domain/user/User";
import type { IPasswordHasher } from "../../ports/auth/IPasswordHasher-ports";
import type { IUserRepository } from "../../ports/repositories/UserRepository-ports";
import type { IJwtTokenProvider } from "../../ports/auth/IJwtTokenProvider-ports";
import { UserValidator } from "../../../domain/user/UserValidator";


export class RegisterUseCase {

    constructor(
        private readonly passwordHasher: IPasswordHasher,
        private readonly userRepository: IUserRepository,
        private readonly jwtTokenProvider: IJwtTokenProvider
    ) { }
    async execute(data: RegisterUserInput) {
        const user = new User(
            data.name,
            data.email,
            data.password,
        )

        const existUser = await this.userRepository.findByEmail(data.email)

        UserValidator.userExist(existUser)


        const hashpassword = await this.passwordHasher.hash(data.password)
        const createdUser = await this.userRepository.create({
            name: user.name,
            email: user.email,
            password: hashpassword
        })

        const accessToken = await this.jwtTokenProvider.generateAccessToken(createdUser.id)
        const refreshToken = await this.jwtTokenProvider.generateRefreshToken(createdUser.id)



        return {
            accessToken,
            refreshToken
        };

    }
}