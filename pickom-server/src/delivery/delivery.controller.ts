import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  FirebaseAuthGuard,
  ReqWithUser,
} from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { OfferService } from 'src/offer/offer.service';
import { TrakingService } from 'src/traking/traking.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { FindReceiverDto } from 'src/user/dto/find-receiver.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly userService: UserService,
    private readonly offerService: OfferService,
    private readonly trakingService: TrakingService,
  ) {}

  // Get all available pickers (GET /pickers)
  // Returns only online pickers (isOnline = true)
  @Get('pickers')
  async getAvailablePickers() {
    const pickers = await this.deliveryService.getAvailablePickers();

    // Filter only online pickers and return with their base price
    return pickers
      .filter((picker) => picker.isOnline === true)
      .map((picker) => ({
        ...picker,
        price: picker.basePrice || 15.0,
      }));
  }

  // Get nearby pickers with distance (GET /pickers/nearby)
  // Returns pickers sorted by distance from given location
  @Get('pickers/nearby')
  async getNearbyPickers(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('deliveryType') deliveryType?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new NotFoundException('Invalid coordinates');
    }

    const type = (deliveryType || 'within-city') as
      | 'within-city'
      | 'suburban'
      | 'inter-city';

    return await this.deliveryService.getNearbyPickers(
      latitude,
      longitude,
      type,
    );
  }

  // Find receiver by email
  @Post('find-receiver')
  @UseGuards(FirebaseAuthGuard)
  async findReceiver(@Body() dto: FindReceiverDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user) {
      return null;
    }

    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  // Create delivery request (POST /delivery/requests)
  // Executed by user with role === 'sender'
  // Accepts CreateDeliveryDto with all delivery data in request body
  @Post('requests')
  @UseGuards(FirebaseAuthGuard)
  async createDeliveryRequest(
    @Req() req: ReqWithUser,
    @Body() createDto: CreateDeliveryDto, // Accept entire DTO object
  ) {
    // Get user UID from Firebase token
    const { uid } = req.user as { uid: string };

    // Call service with sender UID and delivery data
    return await this.deliveryService.createDeliveryRequest(uid, createDto);
  }

  // Get list of requests (GET /delivery/requests)
  // Executed by user with role === 'sender' or 'picker'
  @Get('requests')
  @UseGuards(FirebaseAuthGuard)
  async getAllDeliveryRequests(@Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.deliveryService.getAllDeliveryRequests(uid, user.role);
  }

  // Get request details (GET /delivery/requests/:id)
  // Executed by user with role === 'sender' or 'picker'
  @Get('requests/:id')
  @UseGuards(FirebaseAuthGuard)
  async getDeliveryRequestById(
    @Param('id') id: number,
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.deliveryService.getDeliveryRequestById(
      id,
      uid,
      user.role,
    );
  }

  // Update delivery data (PATCH /delivery/requests/:id)
  // Executed by sender - delivery owner
  // Allows changing any fields: title, description, addresses, price, etc.
  @Patch('requests/:id')
  @UseGuards(FirebaseAuthGuard)
  async updateDelivery(
    @Param('id') id: number,
    @Body() updateDto: UpdateDeliveryDto,
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.deliveryService.updateDelivery(id, uid, updateDto);
  }

  // Picker accepts/rejects request (PUT /delivery/requests/:id/status)
  // Executed by user with role === 'picker'
  @Put('requests/:id/status')
  @UseGuards(FirebaseAuthGuard)
  async updateDeliveryRequestStatus(
    @Param('id') id: number,
    @Body('status')
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'picker') {
      throw new ForbiddenException('User is not a picker');
    }
    return await this.deliveryService.updateDeliveryRequestStatus(
      id,
      status,
      uid,
    );
  }

  @Get('completed')
  @UseGuards(FirebaseAuthGuard)
  async getCompletedDeliveries(@Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.deliveryService.getAllDeliveredDeliveryRequests(
      uid,
      user.role,
    );
  }

  @Get('cancelled')
  @UseGuards(FirebaseAuthGuard)
  async getCancelledDeliveries(@Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.deliveryService.getAllCancelledDeliveryRequests(
      uid,
      user.role,
    );
  }

  // Confirm or reject delivery by recipient
  @Put('requests/:id/confirm-recipient')
  @UseGuards(FirebaseAuthGuard)
  async confirmRecipient(
    @Param('id') id: number,
    @Body('confirmed') confirmed: boolean,
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const result = await this.deliveryService.confirmRecipient(
      id,
      uid,
      confirmed,
    );
    if (!result) {
      throw new NotFoundException('Delivery not found or access denied');
    }
    return result;
  }

  // Confirm receipt of delivery by receiver
  @Post(':id/confirm')
  @UseGuards(FirebaseAuthGuard)
  async confirmDelivery(
    @Param('id') id: string,
    @Req() req: ReqWithUser,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    const { uid } = req.user as { uid: string };
    return await this.deliveryService.confirmDeliveryByReceiver(
      parseInt(id),
      uid,
      dto,
    );
  }

  // Get incoming deliveries for receiver
  @Get('incoming')
  @UseGuards(FirebaseAuthGuard)
  async getIncomingDeliveries(@Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find all deliveries where user is recipient
    const deliveries = await this.deliveryService.getIncomingDeliveries(
      user.id,
    );

    return deliveries;
  }
}
