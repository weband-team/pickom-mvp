import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
import { MOCK_OFFERS } from 'src/mocks/offer.mock';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OfferService {
  private offers = MOCK_OFFERS;

  constructor(
  ){

  }

  async createOffer(deliveryId: number): Promise<Offer> {
    const offer: Offer = {
      id: this.offers.length + 1,
      deliveryId,
      createdAt: new Date(),
      status: 'pending' as const,
    };
    this.offers.push(offer);
    return offer;
  }

  async updateOfferStatus(
    offerId: number,
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled',
  ): Promise<Offer | null> {
    const offerIndex = this.offers.findIndex(offer => offer.id === offerId);
    
    if (offerIndex === -1) {
      return null;
    }

    this.offers[offerIndex].status = status;
    return this.offers[offerIndex];
  }

  async getOfferById(offerId: number): Promise<Offer | null> {
    return this.offers.find(offer => offer.id === offerId) || null;
  }
}
