import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { TSequence } from 'src/woa/entities/tsequence.entity';
import { TSequenceDetail } from 'src/woa/entities/tsequence-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TSequence, TSequenceDetail])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}