import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { jwtTokenGenerator, prismaUserRepository } from "./share-dependencies";

const authMiddleware = new AuthMiddleware(
    jwtTokenGenerator,
    prismaUserRepository,
)

export const Auth = authMiddleware.execute.bind(authMiddleware)