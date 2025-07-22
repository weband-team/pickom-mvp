import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Настройка cookie-parser
  app.use(cookieParser());

  // Настройка CORS
  app.enableCors({
    origin: process.env.CLIENT_URI || 'http://localhost:3000',
    credentials: true,
  });

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Pickom API')
    .setDescription('API документация для приложения Pickom')
    .setVersion('1.0')
    .addTag('auth', 'Авторизация и аутентификация')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'session',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 4242;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
  console.log(`🧪 Test Auth: http://localhost:${port}/test-auth.html`);
}
bootstrap();
