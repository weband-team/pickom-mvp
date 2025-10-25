import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get tracking by ID' })
  async getTracking(@Param('id', ParseIntPipe) id: number) {
    return await this.trackingService.getTracking(id);
  }

  @Get('delivery/:deliveryId')
  @ApiOperation({ summary: 'Get all tracking updates for a delivery' })
  async getTrackingByDelivery(@Param('deliveryId', ParseIntPipe) deliveryId: number) {
    return await this.trackingService.getTrackingByDelivery(deliveryId);
  }

  @Post()
  @ApiOperation({ summary: 'Create tracking update' })
  async createTrackingUpdate(
    @Body() createDto: {
      deliveryId: number;
      status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
      location?: { lat: number; lng: number };
      notes?: string;
    },
  ) {
    return await this.trackingService.createTrackingUpdate(
      createDto.deliveryId,
      createDto.status,
      createDto.location,
      createDto.notes,
    );
  }
}
