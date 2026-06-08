import type { IPasswordHasher } from "../../application/ports/auth/IPasswordHasher-ports";
import bcrypt from 'bcrypt'
export class BcryptPasswordHasher
    implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }
}