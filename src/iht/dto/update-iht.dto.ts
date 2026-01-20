import { PartialType } from '@nestjs/mapped-types';
import { CreateIhtDto } from './create-iht.dto';

export class UpdateIhtDto extends PartialType(CreateIhtDto) {}
