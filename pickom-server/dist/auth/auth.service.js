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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_module_1 = require("./firebase-admin.module");
const user_service_1 = require("../user/user.service");
let AuthService = AuthService_1 = class AuthService {
    userService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userService) {
        this.userService = userService;
    }
    async verifyAndUpsertUser(accessToken, role, name, phone) {
        const decodedToken = await firebase_admin_module_1.admin.auth().verifyIdToken(accessToken);
        const avatar = this.getAvatarSize(decodedToken.picture || '', decodedToken.firebase.sign_in_provider);
        let userInfo = await this.userService.findOne(decodedToken.uid);
        if (!userInfo) {
            userInfo = await this.userService.create({
                uid: decodedToken.uid,
                email: decodedToken.email || '',
                name: name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Unknown'),
                prevLoginAt: new Date(),
                avatarUrl: avatar,
                phone: phone,
                createdAt: new Date(),
                role: role ?? 'sender',
            });
        }
        else {
            userInfo = await this.userService.update(userInfo.uid, {
                prevLoginAt: new Date(),
                avatarUrl: avatar || userInfo.avatarUrl,
            });
        }
        return {
            decodedToken: decodedToken,
            userInfo,
        };
    }
    async createSessionCookie(accessToken) {
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await firebase_admin_module_1.admin.auth().createSessionCookie(accessToken, {
            expiresIn,
        });
        return { sessionCookie, expiresIn };
    }
    async getUserInfo(uid) {
        const userInfo = await this.userService.findOne(uid);
        if (!userInfo) {
            throw new Error('User not found');
        }
        return userInfo;
    }
    async createFirebaseToken(uid) {
        const firebaseToken = await firebase_admin_module_1.admin.auth().createCustomToken(uid);
        return firebaseToken;
    }
    async revokeToken(sessionCookie) {
        try {
            const decodedClaims = await firebase_admin_module_1.admin.auth().verifySessionCookie(sessionCookie, true);
            await firebase_admin_module_1.admin.auth().revokeRefreshTokens(decodedClaims.sub);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new common_1.BadRequestException('You\'re not authorized to access this resource');
            }
            this.logger.error(`Error revoking token: ${error}`);
            throw new common_1.BadRequestException('Error revoking token');
        }
    }
    async generateEmailVerificationLink(email) {
        const actionCodeSettings = {
            url: `${process.env.CLIENT_URI || 'http://localhost:3000'}/profile?emailverified=true`,
        };
        return await firebase_admin_module_1.admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
    }
    async generatePasswordResetLink(email) {
        const actionCodeSettings = {
            url: process.env.CLIENT_URI || 'http://localhost:3000',
        };
        return await firebase_admin_module_1.admin.auth().generatePasswordResetLink(email, actionCodeSettings);
    }
    getAvatarSize(url, provider) {
        if (provider === 'google.com') {
            return url.replace(/=s\d+-c$/, '=s150-c');
        }
        return url;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], AuthService);
//# sourceMappingURL=auth.service.js.map