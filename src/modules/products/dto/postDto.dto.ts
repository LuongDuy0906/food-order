import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class PostDTO{
    @IsString()
    name: string;
    
    @Type(() => Number)
    @IsInt()
    @IsPositive({message: "tuoi phai la so lon hon 0", always: true})
    quantity: number;
}