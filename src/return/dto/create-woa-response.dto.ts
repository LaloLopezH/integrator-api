import { isDate, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateWoaResponseDto {
  @IsNumber()
  id?: number;

  @IsString()
  item_alternate_code?: string;

  @IsString()
  load_unit_code: string;

  @IsString()
  batch_nbr?: string;

  @IsString()
  qty?: string;

  @IsString()
  to_container_nbr: string;

  @IsString()
  pick_location?: string;

  @IsString()
  wworker?: string;

  @IsString()
  dispatch_ramp_number?: string;

  @IsString()
  station_number?: string;

  CreatedDate: Date;
  
  @IsString()
  CreatedUser: number;
  
  ModifiedDate?: Date;
  
  @IsString()
  ModifiedUser?: number;

  @IsBoolean()
  Processed: boolean = false;
}