import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from 'node:process';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config';
import helmet from 'helmet';
import helmetConfig from './config/helmet.config';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  dotenv.config();

  setupSwagger(app);
  app.enableCors({
    origin: 'null', // Allow all origins for development purposes
    credentials: true, // Enable credentials if needed
  });
  app.useGlobalFilters(new CustomExceptionFilter());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    // Make sure to enable this option to show the detailed errors
    exceptionFactory: (errors) => {
      const messages = errors.map(
        (error) => `${error.property} - ${Object.values(error.constraints).join(', ')}`
      );
      return new BadRequestException(messages);
    },
    whitelist: true, // Removes any properties that are not in the DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are sent
    transform: true, // Automatically transform payloads to match DTO types
  }));

  app.use(cookieParser());
  app.use(helmetConfig);

  await app.listen(3001);

}
bootstrap();
