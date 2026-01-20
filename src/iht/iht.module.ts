import { Module } from '@nestjs/common';
import { IhtService } from './iht.service';
import { IhtController } from './iht.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Iht } from './entities/iht.entity';
import { Article } from 'src/article/entities/article.entity';
import { TextService } from 'src/shared/service/text.service';
import { ArticleService } from 'src/article/article.service';
import { XmlService } from 'src/shared/service/xml.service';
import { LoggerService } from 'src/shared/logger/logger.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';
import { Trace } from 'src/trace/entities/trace.entity';
import { SharedModule } from 'src/shared/service/shared.module';
@Module({
  controllers: [IhtController],
  providers: [
    IhtService,
    ArticleService,
    TextService,
    XmlService,
    AuthService,
    AuthModule,
    SharedModule,
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('IHT'),
    },
  ],
  imports:[
    TypeOrmModule.forFeature([ Iht, Article, User, Trace ])
  ]
})
export class IhtModule {}
