import { IsOptional } from "class-validator";

export class CreateIhtDto {
    @IsOptional()
    group_nbr?: string;

    @IsOptional()
    seq_nbr?: number;

    @IsOptional()
    lock_code?: string;

    @IsOptional()
    activity_code?: string;

    @IsOptional()
    lpn_nbr?: string;

    @IsOptional()
    location?: string;

    @IsOptional()
    item_code?: string;

    @IsOptional()
    orig_qty?: number;

    @IsOptional()
    adj_qty?: number;

    @IsOptional()
    ref_value_1?: string;

    @IsOptional()
    screen_name?: string;

    @IsOptional()
    module_name?: string;

    @IsOptional()
    CreatedDate: Date;

    @IsOptional()
    CreatedUser: number;

    @IsOptional()
    ModifiedDate?: Date;

    @IsOptional()
    ModifiedUser?: number;
}
