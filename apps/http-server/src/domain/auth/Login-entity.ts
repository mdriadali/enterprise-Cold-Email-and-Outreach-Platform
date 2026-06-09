import { UserPasswordRequiredError } from "../user/UserError";
import { UserValidator } from "../user/UserValidator";

export class LoginUserEntity{
    constructor(
        public readonly email:string,
        public readonly password:string
    ){
        console.log("login entity class")
        UserValidator.validateEmail(email)

        if(!password){
            throw new UserPasswordRequiredError()
        }
    }
}