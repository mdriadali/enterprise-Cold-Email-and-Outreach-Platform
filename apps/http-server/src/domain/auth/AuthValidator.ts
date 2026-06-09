

export class AuthValidator{
    static isHashValidate(match:boolean){
        if(match===false){
            throw new Error("Invalid credentials")
        }
    }

    static tokenValidator(token:string){
        if(!token){
            throw new Error("Unauthorized")
        }
    }
}