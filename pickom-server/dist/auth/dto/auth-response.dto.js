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
exports.ErrorResponseDto = exports.LogoutResponseDto = exports.MeResponseDto = exports.UserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserDto {
    uid;
    email;
    name;
    avatarUrl;
    role;
    prevLoginAt;
    createdAt;
    emailVerified;
}
exports.UserDto = UserDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Уникальный идентификатор пользователя',
        example: 'user_123456789',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email пользователя',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Имя пользователя',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL аватара пользователя',
        example: 'https://example.com/avatar.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], UserDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Роль пользователя',
        example: 'picker',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата последнего входа',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserDto.prototype, "prevLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата создания аккаунта',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Подтвержден ли email',
        example: true,
    }),
    __metadata("design:type", Boolean)
], UserDto.prototype, "emailVerified", void 0);
class MeResponseDto {
    user;
    message;
}
exports.MeResponseDto = MeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Информация о пользователе',
        type: UserDto,
        required: false,
    }),
    __metadata("design:type", Object)
], MeResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Сообщение о статусе',
        example: 'User data retrieved successfully',
    }),
    __metadata("design:type", String)
], MeResponseDto.prototype, "message", void 0);
class LogoutResponseDto {
    message;
}
exports.LogoutResponseDto = LogoutResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Сообщение об успешном выходе',
        example: 'Logged out successfully',
    }),
    __metadata("design:type", String)
], LogoutResponseDto.prototype, "message", void 0);
class ErrorResponseDto {
    message;
    statusCode;
}
exports.ErrorResponseDto = ErrorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Сообщение об ошибке',
        example: 'Authorization token is missing',
    }),
    __metadata("design:type", String)
], ErrorResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Статус код ошибки',
        example: 400,
    }),
    __metadata("design:type", Number)
], ErrorResponseDto.prototype, "statusCode", void 0);
//# sourceMappingURL=auth-response.dto.js.map