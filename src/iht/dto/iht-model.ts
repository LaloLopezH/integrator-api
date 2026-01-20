import { IsString, IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateShippedLoadDto {
  @IsString()
  facility_code: string;

  @IsString()
  company_code: string;

  @IsString()
  action_code: string;

  @IsString()
  load_type: string;

  @IsString()
  load_manifest_nbr: string;

  @IsNumber()
  total_weight: number;

  @IsDate()
  ship_date: Date;

  @IsString()
  time_zone_code: string;

  @IsOptional()
  @IsString()
  carrier_code?: string;
}