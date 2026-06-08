export interface Userdata {
    id: string
    name: string
    emai: string
    password: string
    role: string
    subscription: string
    aiProvider: string
    apiKey: string
}

export interface RegisterUserInput {
    name: string,
    email: string,
    password: string,
}
export interface CreatedUserData {
    id: string
    name: string,
    email: string,
}