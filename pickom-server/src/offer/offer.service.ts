import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Payment } from '../payment/entities/payment.entity';
import { NotificationService } from 'src/notification/notification.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async createOffer(
    deliveryId: number,
    pickerId: string,
    price: number,
    message?: string,
  ): Promise<Offer> {
    const picker = await this.userService.findOne(pickerId);
    if (!picker) {
      throw new NotFoundException('Picker not found');
    }

    const offer = this.offerRepository.create({
      deliveryId,
      pickerId: picker.id,
      price,
      message,
      status: 'pending',
    });

    const savedOffer = await this.offerRepository.save(offer);

    const delivery = await this.offerRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.delivery', 'delivery')
      .leftJoinAndSelect('delivery.sender', 'sender')
      .where('offer.id = :id', { id: savedOffer.id })
      .getOne();

    if (delivery?.delivery?.sender) {
      await this.notificationService.notifyOfferReceived(
        delivery.delivery.sender.uid,
        deliveryId,
        picker.name,
        price,
      );
    }

    return savedOffer;
  }

  async updateOfferStatus(
    offerId: number,
    status: 'accepted' | 'rejected',
  ): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['delivery', 'delivery.sender', 'picker'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // Payment is now handled separately via payment endpoints
    // No automatic balance deduction here

    offer.status = status;
    const updatedOffer = await this.offerRepository.save(offer);

    if (status === 'accepted' && offer.delivery?.sender) {
      await this.notificationService.notifyOfferAccepted(
        offer.delivery.sender.uid,
        offer.deliveryId,
      );
    }

    return updatedOffer;
  }

  async getOfferById(offerId: number): Promise<Offer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
      relations: ['delivery', 'picker'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async getOffersByDelivery(deliveryId: number): Promise<Offer[]> {
    return await this.offerRepository.find({
      where: { deliveryId },
      relations: ['picker'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyOffers(pickerId: string): Promise<Offer[]> {
    const picker = await this.userService.findOne(pickerId);
    if (!picker) {
      throw new NotFoundException('Picker not found');
    }

    return await this.offerRepository.find({
      where: { pickerId: picker.id },
      relations: ['delivery', 'delivery.sender', 'delivery.picker', 'picker'],
      order: { createdAt: 'DESC' },
    });
  }
}
