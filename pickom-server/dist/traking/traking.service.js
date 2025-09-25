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
exports.TrakingService = void 0;
const common_1 = require("@nestjs/common");
const traking_mock_1 = require("../mocks/traking.mock");
const offer_service_1 = require("../offer/offer.service");
let TrakingService = class TrakingService {
    offerService;
    traking = traking_mock_1.MOCK_TRAKINGS;
    constructor(offerService) {
        this.offerService = offerService;
    }
    async getTraking(id) {
        const traking = this.traking.find(traking => traking.id === id);
        return traking || null;
    }
    async updateTrakingStatus(offerId, status) {
        const currentOffer = await this.offerService.getOfferById(offerId);
        if (!currentOffer) {
            throw new Error('Offer not found');
        }
        const currentStatus = currentOffer.status;
        if (currentStatus === 'in_transit' && status === 'pending') {
            throw new Error('Cannot set status to pending when already in transit');
        }
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            throw new Error(`Cannot change status when offer is already ${currentStatus}`);
        }
        const newTraking = {
            id: this.traking.length + 1,
            offerId,
            status,
            createdAt: new Date(),
        };
        this.traking.push(newTraking);
        await this.offerService.updateOfferStatus(offerId, status);
        return newTraking;
    }
};
exports.TrakingService = TrakingService;
exports.TrakingService = TrakingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [offer_service_1.OfferService])
], TrakingService);
//# sourceMappingURL=traking.service.js.map