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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const delivery_requests_mock_1 = require("../mocks/delivery-requests.mock");
const users_mock_1 = require("../mocks/users.mock");
const user_service_1 = require("../user/user.service");
let DeliveryService = class DeliveryService {
    userService;
    deliveryRequests = delivery_requests_mock_1.MOCK_DELIVERY_REQUESTS;
    users = users_mock_1.MOCK_USERS;
    constructor(userService) {
        this.userService = userService;
    }
    async getAvailablePickers() {
        return await this.userService.findAllPickers();
    }
    async createDeliveryRequest(senderId, pickerId, from, to, price) {
        const newRequest = {
            id: this.deliveryRequests.length + 1,
            senderId,
            pickerId,
            status: 'pending',
            from,
            to,
            price,
            createdAt: new Date(),
        };
        this.deliveryRequests.push(newRequest);
        return newRequest;
    }
    async getAllDeliveryRequests(uid, role) {
        return this.deliveryRequests.filter((request) => role === 'sender' ? request.senderId === uid : request.pickerId === uid);
    }
    async getDeliveryRequestById(id, uid, role) {
        const delivery = this.deliveryRequests.find(request => request.id === id) || null;
        if (!delivery) {
            return null;
        }
        if (role === 'sender' && delivery.senderId !== uid) {
            return null;
        }
        if (role === 'picker' && delivery.pickerId !== uid) {
            return null;
        }
        return delivery;
    }
    async updateDeliveryRequestStatus(id, status, uid) {
        const requestIndex = this.deliveryRequests.findIndex(request => request.id === id);
        if (requestIndex === -1) {
            return null;
        }
        if (this.deliveryRequests[requestIndex].pickerId !== uid) {
            return null;
        }
        this.deliveryRequests[requestIndex].status = status;
        return this.deliveryRequests[requestIndex];
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map