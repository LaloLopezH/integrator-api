import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { LoggerService } from 'src/shared/logger/logger.service';
import { Trace } from 'src/trace/entities/trace.entity';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/auth/entities/user.entity';
import { SharedModule } from 'src/shared/service/shared.module';

@Module({
  controllers: [ArticleController],
  providers: [
    ArticleService,
    SharedModule,
    {
      provide: LoggerService,
      useFactory: () => new LoggerService('ARTICLE'),
    },
    AuthService
  ],
  imports:[
    TypeOrmModule.forFeature([ Article, Trace, User ])
  ],
  exports:[
    ArticleService
  ]
})
export class ArticleModule {}
