import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  FirebaseAuthGuard,
  ReqWithUser,
} from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { TrakingService } from './traking.service';

@Controller('traking')
export class TrakingController {
  constructor(
    private readonly userService: UserService,
    private readonly trakingService: TrakingService,
  ) {}

  @Get('/:deliveryId')
  @UseGuards(FirebaseAuthGuard)
  async getTraking(
    @Param('deliveryId') deliveryId: number,
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has access to this tracking (sender, picker, or receiver)
    const hasAccess = await this.trakingService.hasAccess(deliveryId, user.id);
    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this tracking');
    }

    const tracking = await this.trakingService.getTrackingByDeliveryId(deliveryId);
    if (!tracking) {
      throw new NotFoundException('Tracking not found');
    }

    return tracking;
  }

  @Put('/:deliveryId/location')
  @UseGuards(FirebaseAuthGuard)
  async updateLocation(
    @Param('deliveryId') deliveryId: number,
    @Body() body: { lat: number; lng: number },
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is the picker
    const tracking = await this.trakingService.getTrackingByDeliveryId(deliveryId);
    if (!tracking || tracking.pickerId !== user.id) {
      throw new ForbiddenException('Only the picker can update location');
    }

    return await this.trakingService.updatePickerLocation(deliveryId, {
      lat: body.lat,
      lng: body.lng,
    });
  }

  @Put('/:deliveryId/status')
  @UseGuards(FirebaseAuthGuard)
  async updateStatus(
    @Param('deliveryId') deliveryId: number,
    @Body('status')
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is the picker
    const tracking = await this.trakingService.getTrackingByDeliveryId(deliveryId);
    if (!tracking || tracking.pickerId !== user.id) {
      throw new ForbiddenException('Only the picker can update status');
    }

    try {
      return await this.trakingService.updateStatus(deliveryId, status);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
