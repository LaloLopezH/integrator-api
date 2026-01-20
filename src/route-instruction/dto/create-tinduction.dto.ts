import { IsOptional } from "class-validator";

export class CreateTInductionDto {
    @IsOptional()
    oblpn_nbr?: string;

    @IsOptional()
    oblpn_type_wms?: string;

    @IsOptional()
    route_nbr?: string;

    @IsOptional()
    consolidation?: string;

    @IsOptional()
    asset?: string;
}
