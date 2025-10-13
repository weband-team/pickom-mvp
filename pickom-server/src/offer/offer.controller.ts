import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import {
  FirebaseAuthGuard,
  ReqWithUser,
} from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('offers')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createOffer(
    @Req() req: ReqWithUser,
    @Body() createDto: CreateOfferDto,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'picker') {
      throw new ForbiddenException('Only pickers can create offers');
    }

    return await this.offerService.createOffer(
      createDto.deliveryId,
      uid,
      createDto.price,
      createDto.message,
    );
  }

  @Get('delivery/:deliveryId')
  @UseGuards(FirebaseAuthGuard)
  async getOffersByDelivery(@Param('deliveryId') deliveryId: number) {
    const offers = await this.offerService.getOffersByDelivery(deliveryId);

    return offers.map((offer) => ({
      id: offer.id,
      deliveryId: offer.deliveryId,
      pickerId: offer.picker?.uid || null,
      price: offer.price,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
    }));
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  async updateOfferStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateOfferDto,
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'sender') {
      throw new ForbiddenException('Only senders can update offer status');
    }

    return await this.offerService.updateOfferStatus(id, updateDto.status);
  }

  @Get('my')
  @UseGuards(FirebaseAuthGuard)
  async getMyOffers(@Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const offers = await this.offerService.getMyOffers(uid);

    return offers.map((offer) => ({
      id: offer.id,
      deliveryId: offer.deliveryId,
      pickerId: offer.picker?.uid || uid,
      price: offer.price,
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      delivery: offer.delivery
        ? {
            id: offer.delivery.id,
            senderId: offer.delivery.sender?.uid || null,
            pickerId: offer.delivery.picker?.uid || null,
            fromAddress: offer.delivery.fromAddress,
            toAddress: offer.delivery.toAddress,
            price: offer.delivery.price,
            size: offer.delivery.size,
            status: offer.delivery.status,
          }
        : undefined,
    }));
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getOfferById(@Param('id') id: number) {
    return await this.offerService.getOfferById(id);
  }
}
