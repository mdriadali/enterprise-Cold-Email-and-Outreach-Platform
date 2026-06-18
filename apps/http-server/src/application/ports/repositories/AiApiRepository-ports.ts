import type { AiProvider } from "@repo/db";
import type { aiApiData } from "@repo/types";

export interface IAiApiRepository{
    create(ownerId:string,provider:AiProvider,key:string):Promise<aiApiData>
}