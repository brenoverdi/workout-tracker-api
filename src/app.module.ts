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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UserModule,
    // Add other modules here as you create them:
    // ExerciseModule,
    // ProgramModule,
    // SessionModule,
    // AnalyticsModule,
    // SearchModule,
    // AiCoachModule,
    // FilesModule,
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
