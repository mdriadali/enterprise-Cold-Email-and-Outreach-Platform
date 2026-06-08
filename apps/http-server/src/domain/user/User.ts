import { UserValidator } from "./UserValidator";

export class User{
    constructor(
        public readonly name:string,
        public readonly email:string,
        public readonly password:string,
    ){
        UserValidator.validateName(name)
        UserValidator.validateEmail(email)
        UserValidator.validatePassword(password)
    }
}