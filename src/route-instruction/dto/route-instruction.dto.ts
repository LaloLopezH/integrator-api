import { IsOptional } from "class-validator";

export class RouteInstructionDto {
    @IsOptional()
    mhe_system_code?: string;

    @IsOptional()
    facility_code?: string;

    @IsOptional()
    company_code?: string;
     
    @IsOptional()
    lpn_nbr?: string;

    @IsOptional()
    divert_lane?: string;

    @IsOptional()
    dest_locn_str?: string;

    @IsOptional()
    dest_locn_brcd?: string;
}
