import { UserPasswordRequiredError } from "../user/UserError";
import { UserValidator } from "../user/UserValidator";

export class LoginUserEntity{
    constructor(
        public readonly email:string,
        public readonly password:string
    ){
        UserValidator.validateEmail(email)

        if(!password){
            throw new UserPasswordRequiredError()
        }
    }
}