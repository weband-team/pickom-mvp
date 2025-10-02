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
exports.LoginResponseDto = exports.LoginBodyDto = exports.LoginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
    authorization;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JWT токен доступа от Firebase',
        example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], LoginDto.prototype, "authorization", void 0);
class LoginBodyDto {
    role;
    phone;
    name;
}
exports.LoginBodyDto = LoginBodyDto;
class LoginResponseDto {
    uid;
    email;
    name;
    avatarUrl;
    role;
    prevLoginAt;
    createdAt;
    emailVerified;
}
exports.LoginResponseDto = LoginResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Уникальный идентификатор пользователя',
        example: 'user_123456789',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email пользователя',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Имя пользователя',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL аватара пользователя',
        example: 'https://example.com/avatar.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Роль пользователя',
        example: 'picker',
    }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата последнего входа',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], LoginResponseDto.prototype, "prevLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата создания аккаунта',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], LoginResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Подтвержден ли email',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LoginResponseDto.prototype, "emailVerified", void 0);
//# sourceMappingURL=login.dto.js.map