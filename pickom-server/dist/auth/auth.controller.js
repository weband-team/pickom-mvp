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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const firebase_auth_guard_1 = require("./guards/firebase-auth.guard");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const auth_response_dto_1 = require("./dto/auth-response.dto");
let AuthController = AuthController_1 = class AuthController {
    authService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async login(req, res, authorization, body) {
        try {
            console.log('🔥 Login request received');
            const accessToken = authorization?.replace('Bearer ', '');
            if (!accessToken) {
                throw new common_1.BadRequestException('Authorization token is missing');
            }
            const { userInfo } = await this.authService.verifyAndUpsertUser(accessToken, body?.role, body?.name, body?.phone);
            const { sessionCookie, expiresIn } = await this.authService.createSessionCookie(accessToken);
            res.cookie('session', sessionCookie, {
                maxAge: expiresIn,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            return {
                ...userInfo,
            };
        }
        catch (error) {
            this.logger.error(error);
            throw new common_1.BadRequestException('You\'re not authorized to access this resource');
        }
    }
    async me(req) {
        try {
            if (!req.user) {
                return {
                    user: null,
                    message: 'Authorization is required',
                };
            }
            return {
                user: {
                    ...(await this.authService.getUserInfo(req.user.uid)),
                },
                message: 'User data retrieved successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error at /me: ${error}`);
            throw new common_1.BadRequestException('Internal server error');
        }
    }
    async logout(req, res) {
        try {
            await this.authService.revokeToken(req.cookies.session);
            res.clearCookie('session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            return { message: 'Logged out successfully' };
        }
        catch (error) {
            this.logger.error(`Error at /logout: ${error}`);
            throw new common_1.BadRequestException('Internal server error');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Авторизация пользователя',
        description: 'Авторизует пользователя с помощью Firebase ID токена и создает сессионную куку'
    }),
    (0, swagger_1.ApiHeader)({
        name: 'Authorization',
        description: 'Bearer токен от Firebase Auth',
        required: true,
        example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Пользователь успешно авторизован',
        type: login_dto_1.LoginResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Отсутствует токен авторизации или токен недействителен',
        type: auth_response_dto_1.ErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Headers)('authorization')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, login_dto_1.LoginBodyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Получение информации о текущем пользователе',
        description: 'Возвращает информацию о текущем авторизованном пользователе или null если не авторизован'
    }),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Информация о пользователе получена успешно',
        type: auth_response_dto_1.MeResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Внутренняя ошибка сервера',
        type: auth_response_dto_1.ErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Выход из системы',
        description: 'Отзывает сессионную куку и токены пользователя'
    }),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Пользователь успешно вышел из системы',
        type: auth_response_dto_1.LogoutResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Пользователь не авторизован',
        type: auth_response_dto_1.ErrorResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Внутренняя ошибка сервера',
        type: auth_response_dto_1.ErrorResponseDto,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map