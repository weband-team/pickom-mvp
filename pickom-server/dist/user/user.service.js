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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_module_1 = require("../auth/firebase-admin.module");
let UserService = class UserService {
    users = [];
    constructor() { }
    async findOne(uid) {
        return this.users.find(user => user.uid === uid);
    }
    async findOneByEmail(email) {
        return this.users.find(user => user.email === email) || null;
    }
    async findAll() {
        return [...this.users];
    }
    async findAllPickers() {
        return this.users.filter((user) => user.role === 'picker');
    }
    async create(userData) {
        const uid = userData.uid || this.generateUid();
        const existingUser = this.users.find(user => user.uid === uid);
        if (existingUser) {
            throw new common_1.ConflictException(`User with uid ${uid} already exists`);
        }
        if (userData.email) {
            const existingUserByEmail = this.users.find(user => user.email === userData.email);
            if (existingUserByEmail) {
                throw new common_1.ConflictException(`User with email ${userData.email} already exists`);
            }
        }
        const newUser = {
            uid,
            email: userData.email || '',
            name: userData.name || '',
            avatarUrl: userData.avatarUrl || '',
            prevLoginAt: userData.prevLoginAt || new Date(),
            phone: userData.phone || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: userData.role || 'picker'
        };
        this.users.push(newUser);
        return newUser;
    }
    async update(uid, updateData) {
        const existingUserIndex = this.users.findIndex(user => user.uid === uid);
        if (existingUserIndex === -1) {
            throw new common_1.NotFoundException(`User with uid ${uid} not found`);
        }
        const existingUser = this.users[existingUserIndex];
        if (updateData.email && updateData.email !== existingUser.email) {
            const userWithSameEmail = this.users.find(user => user.email === updateData.email && user.uid !== uid);
            if (userWithSameEmail) {
                throw new common_1.ConflictException('The email address is already in use');
            }
        }
        try {
            await firebase_admin_module_1.admin.auth().updateUser(uid, {
                ...updateData,
            });
        }
        catch (error) {
            if (error.code === 'auth/email-already-exists') {
                throw new common_1.ConflictException('The email address is already in use');
            }
        }
        const updatedUser = {
            ...existingUser,
            ...updateData,
            updatedAt: new Date()
        };
        this.users[existingUserIndex] = updatedUser;
        return updatedUser;
    }
    async delete(uid) {
        const existingUserIndex = this.users.findIndex(user => user.uid === uid);
        if (existingUserIndex === -1) {
            throw new common_1.NotFoundException(`User with uid ${uid} not found`);
        }
        const existingUser = this.users[existingUserIndex];
        try {
            await firebase_admin_module_1.admin.auth().deleteUser(uid);
            await firebase_admin_module_1.admin.app().database().ref(`profiles/${uid}`).remove();
        }
        catch (error) {
            console.error('Error deleting user from Firebase:', error);
        }
        this.users.splice(existingUserIndex, 1);
        return existingUser;
    }
    generateUid() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UserService);
//# sourceMappingURL=user.service.js.map