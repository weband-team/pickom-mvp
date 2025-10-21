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

  // Получить всех курьеров (GET /pickers)
  // Возвращает только пикеров которые online (isOnline = true)
  @Get('pickers')
  async getAvailablePickers() {
    const pickers = await this.deliveryService.getAvailablePickers();

    // Filter only online pickers and return with their base price
    return pickers
      .filter((picker) => picker.isOnline === true)
      .map((picker) => ({
        ...picker,
        price: picker.basePrice || 15.0, // Use picker's base price, default to 15.00 zł
      }));
  }

  // Найти получателя по email или UID
  @Post('find-receiver')
  @UseGuards(FirebaseAuthGuard)
  async findReceiver(@Body() dto: FindReceiverDto) {
    const user = await this.userService.findByEmailOrUid(dto.emailOrUid);

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

  // Создать запрос на доставку (POST /delivery/requests)
  // Выполяняет это пользователь с role === 'sender'
  // Принимает в теле запроса CreateDeliveryDto со всеми данными о доставке
  @Post('requests')
  @UseGuards(FirebaseAuthGuard)
  async createDeliveryRequest(
    @Req() req: ReqWithUser,
    @Body() createDto: CreateDeliveryDto, // Принимаем весь объект DTO
  ) {
    // Получаем UID пользователя из Firebase токена
    const { uid } = req.user as { uid: string };

    // Вызываем сервис с UID отправителя и данными о доставке
    return await this.deliveryService.createDeliveryRequest(uid, createDto);
  }

  // Получить список запросов (GET /delivery/requests)
  // Выполяняет это пользователь с role === 'sender' или 'picker'
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

  // Получить детали запроса (GET /delivery/requests/:id)
  // Выполяняет это пользователь с role === 'sender' или 'picker'
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

  // Обновить данные доставки (PATCH /delivery/requests/:id)
  // Выполяняет это отправитель (sender) - владелец доставки
  // Позволяет изменить любые поля: title, description, addresses, price и т.д.
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

  // Курьер принимает/отклоняет запрос (PUT /delivery/requests/:id/status)
  // Выполяняет это пользователь с role === 'picker'
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
