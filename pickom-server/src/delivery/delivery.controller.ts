import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Получить всех курьеров (GET /pickers)
  @Get('pickers')
  getAvailablePickers() {
    return this.deliveryService.getAvailablePickers();
  }

  // Создать запрос на доставку (POST /delivery/requests)
  @Post('requests')
  createDeliveryRequest(
    @Body('senderId') senderId: string,
    @Body('pickerId') pickerId: string,
    @Body('from') from: string,
    @Body('to') to: string,
  ) {
    return this.deliveryService.createDeliveryRequest(senderId, pickerId, from, to);
  }

  // Получить список запросов (GET /delivery/requests)
  @Get('requests')
  getAllDeliveryRequests() {
    return this.deliveryService.getAllDeliveryRequests();
  }

  // Получить детали запроса (GET /delivery/requests/:id)
  @Get('requests/:id')
  getDeliveryRequestById(@Param('id') id: string) {
    return this.deliveryService.getDeliveryRequestById(id);
  }

  // Курьер принимает/отклоняет запрос (PUT /delivery/requests/:id)
  @Put('requests/:id')
  updateDeliveryRequestStatus(
    @Param('id') id: string,
    @Body('pickerId') pickerId: string,
    @Body('status') status: 'accepted' | 'declined',
  ) {
    return this.deliveryService.updateDeliveryRequestStatus(id, pickerId, status);
  }
}