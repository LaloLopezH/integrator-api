import { Module } from '@nestjs/common';
import { TraceService } from './trace.service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trace } from './entities/trace.entity';

@Module({
  providers: [
    TraceService,
    {
          provide: LoggerService,
          useFactory: () => new LoggerService('TRACE'),
        },
  ],
  imports:[
    TypeOrmModule.forFeature([ Trace ])
  ],
  exports:[
    TraceService
  ]
})
export class TraceModule {}
