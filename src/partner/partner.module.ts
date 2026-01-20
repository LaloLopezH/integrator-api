import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from 'src/shared/logger/logger.service';
import { Trace } from 'src/trace/entities/trace.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { SharedModule } from 'src/shared/service/shared.module';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';

@Module({
  controllers: [PartnerController],
  providers: [
    PartnerService,
    SharedModule,
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('PARTNER'),
    },
    AuthService
  ],
  imports:[
    TypeOrmModule.forFeature([ Trace, User ])
  ],
  exports:[
    PartnerService
  ]
})
export class PartnerModule {}
