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

  constructor(private readonly offerService: OfferService) {}

  async getTraking(id: number): Promise<Traking | null> {
    const traking = this.traking.find((traking) => traking.id === id);
    return traking || null;
  }

  async updateTrakingStatus(
    deliveryId: number,
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
  ): Promise<Traking> {
    const newTraking: Traking = {
      id: this.traking.length + 1,
      deliveryId,
      status,
      createdAt: new Date(),
    };

    this.traking.push(newTraking);
    return newTraking;
  }
}
