export interface IPasswordHasher {
    hash(password: string): Promise<string>,
    hashcompare(inputPassword: string, hashedPassword: string):Promise<boolean>
}