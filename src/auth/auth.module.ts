import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/service/shared.module';
import { LoggerService } from 'src/shared/logger/logger.service';

@Module({
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('AUTH'),
    },
  ],
  imports:[
    TypeOrmModule.forFeature([ User ]),
  ],
  exports: [
    TypeOrmModule
  ]
})
export class AuthModule {}
