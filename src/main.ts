import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './middlewares/error.middleware';
import { LoggerService } from './services/logger.service';
import { config } from './config/env.config';

const envConfig = config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get logger service
  const logger = app.get(LoggerService);
  logger.setContext('Bootstrap');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix(envConfig.apiPrefix);

  const port = envConfig.port;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}/${envConfig.apiPrefix}`);
}

bootstrap();
