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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrakingController = void 0;
const common_1 = require("@nestjs/common");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
const user_service_1 = require("../user/user.service");
const traking_service_1 = require("./traking.service");
let TrakingController = class TrakingController {
    userService;
    trakingService;
    constructor(userService, trakingService) {
        this.userService = userService;
        this.trakingService = trakingService;
    }
    async getTraking(offerId, req) {
        const { uid } = req.user;
        const user = await this.userService.findOne(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== 'sender' && user.role !== 'picker') {
            throw new common_1.ForbiddenException('User is not a sender or picker');
        }
        return await this.trakingService.getTraking(offerId);
    }
    async updateTrakingStatus(offerId, status, req) {
        const { uid } = req.user;
        const user = await this.userService.findOne(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== 'picker') {
            throw new common_1.ForbiddenException('Only pickers can update tracking status');
        }
        try {
            return await this.trakingService.updateTrakingStatus(offerId, status);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.TrakingController = TrakingController;
__decorate([
    (0, common_1.Get)('/:offerId'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrakingController.prototype, "getTraking", null);
__decorate([
    (0, common_1.Put)('/:offerId'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], TrakingController.prototype, "updateTrakingStatus", null);
exports.TrakingController = TrakingController = __decorate([
    (0, common_1.Controller)('traking'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        traking_service_1.TrakingService])
], TrakingController);
//# sourceMappingURL=traking.controller.js.map