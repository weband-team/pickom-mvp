import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { Payment } from '../payment/entities/payment.entity';
import { NotificationService } from 'src/notification/notification.service';
import { UserService } from 'src/user/user.service';
import { DeliveryService } from 'src/delivery/delivery.service';
import { TrakingService } from 'src/traking/traking.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => DeliveryService))
    private readonly deliveryService: DeliveryService,
    private readonly trakingService: TrakingService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
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
      relations: ['delivery', 'delivery.sender', 'delivery.recipient', 'picker'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    // If offer is being accepted, deduct balance from sender and create payment record
    if (status === 'accepted' && offer.delivery?.sender && offer.picker) {
      // Deduct balance from sender
      await this.userService.deductBalance(
        offer.delivery.sender.uid,
        offer.price,
      );

      // Create payment record for audit trail
      const payment = this.paymentRepository.create({
        fromUserId: offer.delivery.sender.id,
        toUserId: offer.picker.id,
        deliveryId: offer.deliveryId,
        amount: offer.price,
        currency: 'usd',
        status: 'pending', // Will be 'completed' when delivery is finished
        paymentMethod: 'balance',
        description: `Payment for delivery #${offer.deliveryId} - Offer #${offerId}`,
        metadata: {
          offerId: offerId.toString(),
          type: 'delivery_payment',
        },
      });

      await this.paymentRepository.save(payment);

      // Update delivery: set picker and status to 'accepted'
      console.log(`[OfferService] Updating delivery ${offer.deliveryId} with pickerId ${offer.picker.id}`);
      await this.deliveryService.updateDeliveryPicker(
        offer.deliveryId,
        offer.picker.id,
        'accepted'
      );

      // Create tracking record for real-time location tracking
      console.log(`[OfferService] Creating tracking for delivery ${offer.deliveryId}`);
      try {
        await this.trakingService.createTracking(offer.deliveryId);
        console.log(`[OfferService] Tracking created successfully for delivery ${offer.deliveryId}`);
      } catch (error) {
        console.error(`[OfferService] Error creating tracking:`, error.message);
        // Continue even if tracking creation fails
      }

      // Create chat between sender and picker
      console.log('[OfferService] Creating chat between picker and sender', {
        pickerUid: offer.picker.uid,
        senderUid: offer.delivery.sender.uid,
        deliveryId: offer.deliveryId,
      });
      try {
        await this.chatService.createChat(offer.picker.uid, {
          participantId: offer.delivery.sender.uid,
          deliveryId: offer.deliveryId,
        });
        console.log('[OfferService] Created sender chat successfully');
      } catch (error) {
        console.error('[OfferService] Error creating sender chat:', error.message);
      }

      // Create chat between picker and receiver (if receiver exists)
      if (offer.delivery.recipient) {
        console.log('[OfferService] Creating chat between picker and receiver', {
          pickerUid: offer.picker.uid,
          recipientUid: offer.delivery.recipient.uid,
          deliveryId: offer.deliveryId,
        });
        try {
          await this.chatService.createChat(offer.picker.uid, {
            participantId: offer.delivery.recipient.uid,
            deliveryId: offer.deliveryId,
          });
          console.log('[OfferService] Created receiver chat successfully');
        } catch (error) {
          console.error('[OfferService] Error creating receiver chat:', error.message);
        }
      }

      // Notify sender that offer was accepted
      await this.notificationService.notifyOfferAccepted(
        offer.delivery.sender.uid,
        offer.deliveryId,
      );

      // Reject all other pending offers for this delivery
      await this.rejectOtherOffers(offer.deliveryId, offerId);
    }

    offer.status = status;
    const updatedOffer = await this.offerRepository.save(offer);

    return updatedOffer;
  }

  private async rejectOtherOffers(deliveryId: number, acceptedOfferId: number): Promise<void> {
    const otherOffers = await this.offerRepository.find({
      where: { deliveryId, status: 'pending' },
    });

    for (const offer of otherOffers) {
      if (offer.id !== acceptedOfferId) {
        offer.status = 'rejected';
        await this.offerRepository.save(offer);
      }
    }
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
