import { IsString } from "class-validator";

export class TramaDto {
    @IsString()
    Trama: string;
}