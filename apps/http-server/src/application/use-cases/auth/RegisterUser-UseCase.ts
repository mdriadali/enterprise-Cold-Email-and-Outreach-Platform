import type { RegisterUserInput } from "@repo/types";
import type { IPasswordHasher } from "../../ports/auth/IPasswordHasher-ports";
import type { IUserRepository } from "../../ports/repositories/UserRepository-ports";
import type { IJwtTokenProvider } from "../../ports/auth/IJwtTokenProvider-ports";
import { UserValidator } from "../../../domain/user/UserValidator";
import { RegisterUserEntity } from "../../../domain/auth/Register-entity";


export class RegisterUserUseCase {

    constructor(
        private readonly passwordHasher: IPasswordHasher,
        private readonly userRepository: IUserRepository,
        private readonly jwtTokenProvider: IJwtTokenProvider
    ) { }
    async execute(registerdata: RegisterUserInput) {
        const registerEntity = new RegisterUserEntity(
            registerdata.name,
            registerdata.email,
            registerdata.password,
        )

        const existUser = await this.userRepository.findByEmail(registerdata.email)

        UserValidator.userExist(existUser)


        const hashpassword = await this.passwordHasher.hash(registerdata.password)
        const createdUser = await this.userRepository.create({
            name: registerdata.name,
            email: registerdata.email,
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