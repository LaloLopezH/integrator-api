import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { LoggerService } from 'src/shared/logger/logger.service';
import { Trace } from 'src/trace/entities/trace.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { SharedModule } from 'src/shared/service/shared.module';

@Module({
  controllers: [RouteController],
  providers: [
    RouteService,
    SharedModule,
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('ROUTE'),
    },
    AuthService
  ],
  imports:[
    TypeOrmModule.forFeature([ Route, Trace, User ])
  ],
  exports: [
    RouteService
  ]
})
export class RouteModule {}
