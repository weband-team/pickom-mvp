import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryTracking } from './entities/tracking.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(DeliveryTracking)
    private trackingRepository: Repository<DeliveryTracking>,
  ) {}

  async getTracking(id: number): Promise<DeliveryTracking | null> {
    return await this.trackingRepository.findOne({
      where: { id },
      relations: ['delivery']
    });
  }

  async getTrackingByDelivery(deliveryId: number): Promise<DeliveryTracking[]> {
    return await this.trackingRepository.find({
      where: { deliveryId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTrackingUpdate(
    deliveryId: number,
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    location?: { lat: number; lng: number },
    notes?: string,
  ): Promise<DeliveryTracking> {
    const tracking = this.trackingRepository.create({
      deliveryId,
      status,
      location: location || null,
      notes: notes || null,
    });

    return await this.trackingRepository.save(tracking);
  }

  async updateTrackingStatus(
    deliveryId: number,
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
  ): Promise<DeliveryTracking> {
    return await this.createTrackingUpdate(deliveryId, status);
  }
}
