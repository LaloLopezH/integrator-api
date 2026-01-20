import { IsOptional } from "class-validator";

export class CreateTraceDto {
    @IsOptional()
    Interface?: string;

    @IsOptional()
    TramaSent?: string;

    @IsOptional()
    TramaReceived?: string;

    @IsOptional()
    Detail?: string;

    @IsOptional()
    CreatedDate: Date;

    @IsOptional()
    CreatedUser: number;
}
