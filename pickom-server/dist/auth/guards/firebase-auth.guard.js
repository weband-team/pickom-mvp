"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuardMe = exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_module_1 = require("../firebase-admin.module");
require("dotenv/config");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const sessionCookie = request.cookies.session;
        if (!sessionCookie)
            return false;
        try {
            const decodedClaims = await firebase_admin_module_1.admin.auth().verifySessionCookie(sessionCookie, true);
            if (!decodedClaims.email) {
                response.clearCookie('session', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                });
                return false;
            }
            request.user = {
                email: decodedClaims.email,
                uid: decodedClaims.uid,
            };
            return true;
        }
        catch (error) {
            console.error(error);
            response.clearCookie('session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            return false;
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)()
], FirebaseAuthGuard);
let FirebaseAuthGuardMe = class FirebaseAuthGuardMe {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const sessionCookie = request.cookies.session;
        if (!sessionCookie) {
            request.user = null;
            return true;
        }
        try {
            const decodedClaims = await firebase_admin_module_1.admin.auth().verifySessionCookie(sessionCookie, true);
            if (!decodedClaims.email) {
                response.clearCookie('session', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                });
                return false;
            }
            request.user = {
                email: decodedClaims.email,
                uid: decodedClaims.uid,
            };
            return true;
        }
        catch (error) {
            console.error(error);
            response.clearCookie('session', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            return false;
        }
    }
};
exports.FirebaseAuthGuardMe = FirebaseAuthGuardMe;
exports.FirebaseAuthGuardMe = FirebaseAuthGuardMe = __decorate([
    (0, common_1.Injectable)()
], FirebaseAuthGuardMe);
//# sourceMappingURL=firebase-auth.guard.js.map