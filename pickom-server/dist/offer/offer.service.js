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
exports.OfferService = void 0;
const common_1 = require("@nestjs/common");
const offer_mock_1 = require("../mocks/offer.mock");
let OfferService = class OfferService {
    offers = offer_mock_1.MOCK_OFFERS;
    constructor() {
    }
    async createOffer(deliveryId) {
        const offer = {
            id: this.offers.length + 1,
            deliveryId,
            createdAt: new Date(),
            status: 'pending',
        };
        this.offers.push(offer);
        return offer;
    }
    async updateOfferStatus(offerId, status) {
        const offerIndex = this.offers.findIndex(offer => offer.id === offerId);
        if (offerIndex === -1) {
            return null;
        }
        this.offers[offerIndex].status = status;
        return this.offers[offerIndex];
    }
    async getOfferById(offerId) {
        return this.offers.find(offer => offer.id === offerId) || null;
    }
};
exports.OfferService = OfferService;
exports.OfferService = OfferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OfferService);
//# sourceMappingURL=offer.service.js.map