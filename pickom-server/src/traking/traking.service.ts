import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
import { MOCK_OFFERS } from 'src/mocks/offer.mock';
import { MOCK_TRAKINGS } from 'src/mocks/traking.mock';
import { Traking } from './entities/traking.entity';
import { OfferService } from 'src/offer/offer.service';

@Injectable()
export class TrakingService {
  private traking = MOCK_TRAKINGS;

  constructor(
    private readonly offerService: OfferService,
  ){

  }

  async getTraking(id: number): Promise<Traking | null> {
    const traking = this.traking.find(traking => traking.id === id);
    return traking || null;
  }

  async updateTrakingStatus(
    offerId: number,
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled',
  ): Promise<Traking> {
    // Получаем текущий статус оффера
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

    const newTraking: Traking = {
      id: this.traking.length + 1,
      offerId,
      status,
      createdAt: new Date(),
    };

    this.traking.push(newTraking);
    await this.offerService.updateOfferStatus(offerId, status);
    return newTraking;
  }
}
