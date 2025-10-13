import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  RawBodyRequest,
  HttpCode,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  TopUpBalanceDto,
} from './dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  async createPaymentIntent(
    @Req() req: Request,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const userId = req['user']?.id || 2; // Get from auth middleware
    return this.paymentService.createPaymentIntent(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Req() req: Request,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const userId = req['user']?.id || 2; // Get from auth middleware
    return this.paymentService.createCheckoutSession(
      userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(
      confirmPaymentDto.paymentIntentId,
    );
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new Error(
        'Raw body is required for webhook signature verification',
      );
    }
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }

  @Get('user')
  async getUserPayments(@Req() req: Request) {
    const userId = req['user']?.id || 1; // Get from auth middleware
    return this.paymentService.getPaymentsByUser(userId);
  }

  @Get(':id')
  async getPaymentById(@Param('id') id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @Post('topup-balance')
  async topUpBalance(@Body() topUpBalanceDto: TopUpBalanceDto) {
    return this.paymentService.topUpBalance(topUpBalanceDto);
  }
}
