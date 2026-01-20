import { IsOptional } from "class-validator";

export class CreateRouteDto {
    @IsOptional()
    RUTA?: string;

    @IsOptional()
    Activo?: string;

    @IsOptional()
    HDR_CUST1?: string;

    @IsOptional()
    HDR_CUST2?: string;

    @IsOptional()
    HDR_CUST3?: string;

    @IsOptional()
    HDR_CUST4?: string;

    @IsOptional()
    Mod?: string;

    @IsOptional()
    Parada?: string;

    @IsOptional()
    DTL_CUST_1?: string;

    @IsOptional()
    DTL_CUST_2?: string;

    @IsOptional()
    CreatedDate: Date;

    @IsOptional()
    CreatedUser: number;

    @IsOptional()
    ModifiedDate?: Date;

    @IsOptional()
    ModifiedUser?: number;
}
