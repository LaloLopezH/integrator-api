import { Module, Global } from '@nestjs/common';
import { TcpService } from '../tcp-service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { TraceService } from 'src/trace/trace.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trace } from 'src/trace/entities/trace.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ Trace ]),
  ],
  providers: [
    TcpService, 
    TraceService,
    {
        provide: LoggerService,
        useFactory: () => new LoggerService('TCP'),
    },
],
  exports: [TcpService],
})
export class TcpModule {}