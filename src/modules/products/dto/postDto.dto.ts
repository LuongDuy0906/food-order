import { Type } from "class-transformer";
import { IsInt, IsPositive, IsString } from "class-validator";

export class PostDTO{
    @IsString({groups: ["create"]})
    name: string;
    
    @Type(() => Number)
    @IsInt({groups: ["create"]})
    @IsPositive({message: "tuoi phai la so lon hon 0", always: true})
    quantity: number;
}