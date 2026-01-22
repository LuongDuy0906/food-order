import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class PutDTO{
    @IsOptional()
    @IsString({message: "Tên sản phẩm phải là ký tự"})
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({message: "Số lương sản phẩm phải là số"})
    @IsPositive({message: "Số lương phải >= 0"})
    quantity?: number;

    @IsOptional()
    @IsArray()
    idToKeep: number[];
}