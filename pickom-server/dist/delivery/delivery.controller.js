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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const delivery_service_1 = require("./delivery.service");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
const user_service_1 = require("../user/user.service");
const offer_service_1 = require("../offer/offer.service");
const traking_service_1 = require("../traking/traking.service");
let DeliveryController = class DeliveryController {
    deliveryService;
    userService;
    offerService;
    trakingService;
    constructor(deliveryService, userService, offerService, trakingService) {
        this.deliveryService = deliveryService;
        this.userService = userService;
        this.offerService = offerService;
        this.trakingService = trakingService;
    }
    async getAvailablePickers() {
        const pickers = await this.deliveryService.getAvailablePickers();
        return pickers.map(picker => ({
            ...picker,
            price: Math.random() * 100,
        }));
    }
    async createDeliveryRequest(req, pickerId, from, to, price) {
        const { uid } = req.user;
        return await this.deliveryService.createDeliveryRequest(uid, pickerId, from, to, price);
    }
    async getAllDeliveryRequests(req) {
        const { uid } = req.user;
        const user = await this.userService.findOne(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return await this.deliveryService.getAllDeliveryRequests(uid, user.role);
    }
    async getDeliveryRequestById(id, req) {
        const { uid } = req.user;
        const user = await this.userService.findOne(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return await this.deliveryService.getDeliveryRequestById(id, uid, user.role);
    }
    async updateDeliveryRequestStatus(id, status, req) {
        const { uid } = req.user;
        const user = await this.userService.findOne(uid);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== 'picker') {
            throw new common_1.ForbiddenException('User is not a picker');
        }
        await this.deliveryService.updateDeliveryRequestStatus(id, status, uid);
        if (status === 'accepted') {
            const offer = await this.offerService.createOffer(id);
            await this.trakingService.updateTrakingStatus(offer.id, 'pending');
        }
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Get)('pickers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getAvailablePickers", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('pickerId')),
    __param(2, (0, common_1.Body)('from')),
    __param(3, (0, common_1.Body)('to')),
    __param(4, (0, common_1.Body)('price')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "createDeliveryRequest", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getAllDeliveryRequests", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getDeliveryRequestById", null);
__decorate([
    (0, common_1.Put)('requests/:id'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "updateDeliveryRequestStatus", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService,
        user_service_1.UserService,
        offer_service_1.OfferService,
        traking_service_1.TrakingService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map