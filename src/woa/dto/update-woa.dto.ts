import { PartialType } from '@nestjs/mapped-types';
import { CreateWoaDto } from './create-woa.dto';
import { IsOptional } from 'class-validator';

export class UpdateWoaDto extends PartialType(CreateWoaDto) {

}