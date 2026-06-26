import type { IPasswordHasher } from '@repo/ports';
import bcrypt from 'bcrypt'
export class BcryptPasswordHasher
    implements IPasswordHasher {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }
    async hashcompare(inputPassword: string, hashedPassword: string): Promise<boolean> {
        const match = await bcrypt.compare(
            inputPassword,
            hashedPassword
        );

        return match
    }
}
