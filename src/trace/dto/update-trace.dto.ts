import { PartialType } from '@nestjs/mapped-types';
import { CreateTraceDto } from './create-trace.dto';

export class UpdateTraceDto extends PartialType(CreateTraceDto) {}
