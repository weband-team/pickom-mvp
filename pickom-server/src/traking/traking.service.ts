import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tracking } from './entities/traking.entity';
import { DeliveryService } from 'src/delivery/delivery.service';

@Injectable()
export class TrakingService {
  constructor(
    @InjectRepository(Tracking)
    private readonly trackingRepository: Repository<Tracking>,
    @Inject(forwardRef(() => DeliveryService))
    private readonly deliveryService: DeliveryService,
  ) {}

  async createTracking(deliveryId: number): Promise<Tracking> {
    const delivery = await this.deliveryService.findOne(deliveryId);
    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    if (!delivery.pickerId) {
      throw new NotFoundException('Delivery has no picker assigned');
    }

    const tracking = new Tracking();
    tracking.deliveryId = delivery.id;
    tracking.pickerId = delivery.pickerId;
    tracking.senderId = delivery.senderId;
    tracking.receiverId = delivery.recipientId || null;
    tracking.fromLocation = delivery.fromLocation!;
    tracking.toLocation = delivery.toLocation!;
    tracking.status = delivery.status;
    tracking.pickerLocation = null;

    console.log('[TrakingService] Creating tracking with data:', {
      deliveryId: tracking.deliveryId,
      pickerId: tracking.pickerId,
      senderId: tracking.senderId,
      receiverId: tracking.receiverId,
      status: tracking.status,
    });

    return await this.trackingRepository.save(tracking);
  }

  async getTrackingByDeliveryId(deliveryId: number): Promise<Tracking | null> {
    return await this.trackingRepository.findOne({
      where: { deliveryId },
      relations: ['picker', 'sender', 'receiver', 'delivery'],
    });
  }

  async updatePickerLocation(
    deliveryId: number,
    location: { lat: number; lng: number },
  ): Promise<Tracking> {
    const tracking = await this.getTrackingByDeliveryId(deliveryId);
    if (!tracking) {
      throw new NotFoundException('Tracking not found');
    }

    tracking.pickerLocation = {
      lat: location.lat,
      lng: location.lng,
      timestamp: new Date().toISOString(),
    };

    return await this.trackingRepository.save(tracking);
  }

  async updateStatus(
    deliveryId: number,
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
  ): Promise<Tracking> {
    const tracking = await this.getTrackingByDeliveryId(deliveryId);
    if (!tracking) {
      throw new NotFoundException('Tracking not found');
    }

    tracking.status = status;
    return await this.trackingRepository.save(tracking);
  }

  async deleteTracking(deliveryId: number): Promise<void> {
    const tracking = await this.getTrackingByDeliveryId(deliveryId);
    if (tracking) {
      await this.trackingRepository.remove(tracking);
    }
  }

  async hasAccess(deliveryId: number, userId: number): Promise<boolean> {
    // First check tracking
    const tracking = await this.getTrackingByDeliveryId(deliveryId);
    if (tracking) {
      return (
        tracking.senderId === userId ||
        tracking.pickerId === userId ||
        tracking.receiverId === userId
      );
    }

    // If tracking doesn't exist yet, check delivery
    const delivery = await this.deliveryService.findOne(deliveryId);
    if (!delivery) {
      return false;
    }

    return (
      delivery.senderId === userId ||
      delivery.pickerId === userId ||
      delivery.recipientId === userId
    );
  }

  // Legacy methods for backward compatibility
  async getTraking(id: number): Promise<Tracking | null> {
    return this.getTrackingByDeliveryId(id);
  }

  async updateTrakingStatus(
    deliveryId: number,
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
  ): Promise<Tracking> {
    return this.updateStatus(deliveryId, status);
  }
}
