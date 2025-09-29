import { Injectable } from '@nestjs/common';
import { MOCK_DELIVERY_REQUESTS } from 'src/mocks/delivery-requests.mock';
import { MOCK_USERS } from 'src/mocks/users.mock';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
import { MOCK_OFFERS } from 'src/mocks/offer.mock';
import { Offer } from './entities/offer.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class OfferService {
  private offers = [...MOCK_OFFERS];
  private deliveries = MOCK_DELIVERY_REQUESTS;
  private users = MOCK_USERS;

  constructor(
    private readonly notificationService: NotificationService,
  ){

  }

  async createOffer(
    deliveryId: number,
    pickerId: number,
    price: number,
    message?: string
  ): Promise<Offer> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    const picker = this.users.find(u => parseInt(u.uid) === pickerId);

    if (!delivery || !picker) {
      throw new Error('Delivery or picker not found');
    }

    const offer: Offer = {
      id: this.offers.length + 1,
      delivery_id: deliveryId,
      picker_id: pickerId,
      price,
      message,
      status: 'pending',
      created_at: new Date(),
    };

    this.offers.push(offer);

    // Создаем уведомление для отправителя о новом предложении
    await this.notificationService.notifyOfferReceived(
      delivery.senderId,
      deliveryId,
      picker.name,
      price
    );

    return offer;
  }

  async updateOfferStatus(
    offerId: number,
    status: 'pending' | 'accepted' | 'rejected',
  ): Promise<Offer | null> {
    const offerIndex = this.offers.findIndex(offer => offer.id === offerId);

    if (offerIndex === -1) {
      return null;
    }

    const offer = this.offers[offerIndex];
    const delivery = this.deliveries.find(d => d.id === offer.delivery_id);

    this.offers[offerIndex].status = status;

    // Если предложение принято, создаем уведомление
    if (status === 'accepted' && delivery) {
      await this.notificationService.notifyOfferAccepted(
        delivery.senderId,
        offer.delivery_id
      );
    }

    return this.offers[offerIndex];
  }

  async getOfferById(offerId: number): Promise<Offer | null> {
    return this.offers.find(offer => offer.id === offerId) || null;
  }

  async getOffersByDelivery(deliveryId: number): Promise<Offer[]> {
    return this.offers.filter(offer => offer.delivery_id === deliveryId);
  }
}
