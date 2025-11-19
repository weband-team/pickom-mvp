import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json } from 'express';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // Enable raw body globally
  });

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Настройка cookie-parser
  app.use(cookieParser());

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [${timestamp}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'no-origin'}`);
    next();
  });

  // Настройка CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);

      // In development, allow all localhost and local network origins
      if (isDevelopment) {
        const isLocalOrigin =
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.includes('10.0.2.2') ||
          origin.includes('192.168.') ||
          origin.includes('10.') ||
          origin.includes('172.') ||
          origin.includes('capacitor://');

        if (isLocalOrigin) {
          return callback(null, true);
        }
      }

      // Production: only allow specific origins
      const allowedOrigins = [
        process.env.CLIENT_URI,
        'http://localhost:3000',
        'capacitor://localhost',
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(null, true); // In dev, allow anyway and just warn
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🌐 Network: http://0.0.0.0:${port} (accessible from any device)`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
  console.log(`🧪 Test Auth: http://localhost:${port}/test-auth.html`);
}
bootstrap();
