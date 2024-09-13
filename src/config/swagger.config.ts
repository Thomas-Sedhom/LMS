import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('API documentation for the Learning Management System')
    .setVersion('1.0')
    .addBearerAuth()  // Add security scheme if needed
    .setContact(
      'Support',
      '01003428624',
      'thomassedhom5@gmail.com',
    )
    .addServer('/api/v1') // Add the server path with prefix
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: 'api/v1/docs-json',
  });
};