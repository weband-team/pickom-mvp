"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
require("dotenv/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.use(cookieParser());
    app.enableCors({
        origin: process.env.CLIENT_URI || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Pickom API')
        .setDescription('API документация для приложения Pickom')
        .setVersion('1.0')
        .addTag('auth', 'Авторизация и аутентификация')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addCookieAuth('session', {
        type: 'apiKey',
        in: 'cookie',
        name: 'session',
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT ?? 4242;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api`);
    console.log(`🧪 Test Auth: http://localhost:${port}/test-auth.html`);
}
bootstrap();
//# sourceMappingURL=main.js.map