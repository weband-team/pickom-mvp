import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({
    summary: 'API Information',
    description: 'Returns information about available endpoints and documentation',
  })
  @ApiResponse({
    status: 200,
    description: 'API Information',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Pickom API Server' },
        version: { type: 'string', example: '1.0.0' },
        documentation: { type: 'string', example: 'http://localhost:3000/api' },
        testPage: {
          type: 'string',
          example: 'http://localhost:3000/test-auth.html',
        },
        endpoints: {
          type: 'object',
          properties: {
            auth: {
              type: 'object',
              properties: {
                login: { type: 'string', example: 'POST /auth/login' },
                me: { type: 'string', example: 'GET /auth/me' },
                logout: { type: 'string', example: 'POST /auth/logout' },
              },
            },
          },
        },
      },
    },
  })
  getInfo() {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://your-domain.com'
        : 'http://localhost:3000';

    return {
      message: '🔥 Pickom API Server',
      version: '1.0.0',
      mode: process.env.NODE_ENV || 'development',
      documentation: `${baseUrl}/api`,
      testPage: `${baseUrl}/test-auth.html`,
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          me: 'GET /auth/me',
          logout: 'POST /auth/logout',
        },
      },
      firebase: {
        initialized: true,
        mode: process.env.FIREBASE_PROJECT_ID ? 'production' : 'mock',
      },
    };
  }
}
