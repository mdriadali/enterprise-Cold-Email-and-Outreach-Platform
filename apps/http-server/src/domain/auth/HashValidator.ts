export class HashValidator{
    static isHashValidate(match:boolean){
        if(match===false){
            throw new Error("Invalid credentials")
        }
    }
}