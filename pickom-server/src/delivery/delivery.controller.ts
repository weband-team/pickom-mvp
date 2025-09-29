import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { FirebaseAuthGuard, ReqWithUser } from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { OfferService } from 'src/offer/offer.service';
import { TrakingService } from 'src/traking/traking.service';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly userService: UserService,
    private readonly offerService: OfferService,
    private readonly trakingService: TrakingService,
  ) { }

  // Получить всех курьеров (GET /pickers)
  // получение осуществляется из замоканыых данных по users где role === 'picker'
  @Get('pickers')
  async getAvailablePickers() {
    const pickers = await this.deliveryService.getAvailablePickers();
    return pickers.map(picker => ({
      ...picker,
      price: Math.random() * 100, // строка вида "$42.38"
    }));
  }

  // Создать запрос на доставку (POST /delivery/requests)
  // Выполяняет это пользователь с role === 'sender'
  @Post('requests')
  @UseGuards(FirebaseAuthGuard)
  async createDeliveryRequest(
    @Req() req: ReqWithUser,
    @Body('pickerId') pickerId: string,
    @Body('from') from: string,
    @Body('to') to: string,
    @Body('price') price: number,
  ) {
    const { uid } = req.user as { uid: string };
    return await this.deliveryService.createDeliveryRequest(uid, pickerId, from, to, price);
  }

  // Получить список запросов (GET /delivery/requests)
  // Выполяняет это пользователь с role === 'sender' или 'picker'
  @Get('requests')
  @UseGuards(FirebaseAuthGuard)
  async getAllDeliveryRequests(
    @Req() req: ReqWithUser,
  ) {
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
    return await this.deliveryService.getDeliveryRequestById(id, uid, user.role);
  }

  // Курьер принимает/отклоняет запрос (PUT /delivery/requests/:id)
  // Выполяняет это пользователь с role === 'picker'
  @Put('requests/:id')
  @UseGuards(FirebaseAuthGuard)
  async updateDeliveryRequestStatus(
    @Param('id') id: number,
    @Body('status') status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
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
    return await this.deliveryService.updateDeliveryRequestStatus(id, status, uid);
  }
}