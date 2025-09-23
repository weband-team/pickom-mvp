"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let AppController = class AppController {
    getInfo() {
        const baseUrl = process.env.NODE_ENV === 'production'
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
                    logout: 'POST /auth/logout'
                }
            },
            firebase: {
                initialized: true,
                mode: process.env.FIREBASE_PROJECT_ID ? 'production' : 'mock'
            }
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Информация о API',
        description: 'Возвращает информацию о доступных эндпоинтах и документации'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Информация о API',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Pickom API Server' },
                version: { type: 'string', example: '1.0.0' },
                documentation: { type: 'string', example: 'http://localhost:3000/api' },
                testPage: { type: 'string', example: 'http://localhost:3000/test-auth.html' },
                endpoints: {
                    type: 'object',
                    properties: {
                        auth: {
                            type: 'object',
                            properties: {
                                login: { type: 'string', example: 'POST /auth/login' },
                                me: { type: 'string', example: 'GET /auth/me' },
                                logout: { type: 'string', example: 'POST /auth/logout' }
                            }
                        }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getInfo", null);
exports.AppController = AppController = __decorate([
    (0, swagger_1.ApiTags)('app'),
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map