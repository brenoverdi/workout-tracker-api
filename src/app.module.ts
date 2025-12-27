import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { config } from './config/env.config';

// Services
import { RedisService } from './services/redis.service';
import { ElasticsearchService } from './services/elasticsearch.service';
import { S3Service } from './services/s3.service';
import { GroqService } from './services/groq.service';
import { LoggerService } from './services/logger.service';

// Middlewares
import { LoggingMiddleware } from './middlewares/logging.middleware';

// Modules
import { UserModule } from './modules/user/module';
import { ExerciseModule } from './modules/exercise/module';
import { ProgramModule } from './modules/program/module';
import { SessionModule } from './modules/session/module';
import { AnalyticsModule } from './modules/analytics/module';
import { DashboardModule } from './modules/dashboard/module';
import { TutorialModule } from './modules/tutorial/module';
import { SearchModule } from './modules/search/module';
import { AiCoachModule } from './modules/ai-coach/module';
import { FilesModule } from './modules/files/module';
import { SystemLogsModule } from './modules/system-logs/module';
import { SeedModule } from './database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UserModule,
    ExerciseModule,
    ProgramModule,
    SessionModule,
    AnalyticsModule,
    DashboardModule,
    TutorialModule,
    SearchModule,
    AiCoachModule,
    FilesModule,
    SystemLogsModule,
    SeedModule,
  ],
  providers: [
    RedisService,
    ElasticsearchService,
    S3Service,
    GroqService,
    LoggerService,
  ],
  exports: [
    RedisService,
    ElasticsearchService,
    S3Service,
    GroqService,
    LoggerService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
