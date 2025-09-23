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
exports.User = void 0;
const swagger_1 = require("@nestjs/swagger");
class User {
    uid;
    email;
    name;
    avatarUrl;
    role;
    prevLoginAt;
    createdAt;
    updatedAt;
    phone;
}
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Уникальный идентификатор пользователя',
        example: 'user_123456789',
    }),
    __metadata("design:type", String)
], User.prototype, "uid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email пользователя',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Имя пользователя',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL аватара пользователя',
        example: 'https://example.com/avatar.jpg',
        required: false,
    }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Роль пользователя в системе',
        example: 'picker',
        enum: ['picker', 'sender', 'moderator'],
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата последнего входа в систему',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], User.prototype, "prevLoginAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата создания аккаунта',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Дата последнего обновления профиля',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Номер телефона пользователя',
        example: '+79999999999',
    }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
//# sourceMappingURL=user.type.js.map