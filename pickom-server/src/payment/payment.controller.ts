import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentDto,
  TopUpBalanceDto,
  AttachPaymentMethodDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FirebaseAuthGuard, ReqWithUser } from '../auth/guards/firebase-auth.guard';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(FirebaseAuthGuard)
  async createPaymentIntent(
    @Req() req: ReqWithUser,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.createPaymentIntentByUid(
      firebaseUid,
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
    @Req() req: Request,
  ) {
    // When using express.raw(), the body is a Buffer
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

    if (!signature) {
      throw new Error('Stripe signature header is missing');
    }

    return this.paymentService.handleWebhook(signature, rawBody);
  }

  @Get('user')
  @UseGuards(FirebaseAuthGuard)
  async getUserPayments(@Req() req: ReqWithUser) {
    const firebaseUid = req.user.uid;
    return this.paymentService.getPaymentsByUserUid(firebaseUid);
  }

  // =====================
  // Payment Cards Endpoints
  // =====================
  // IMPORTANT: These routes must be before @Get(':id') to avoid route conflicts

  @Get('cards')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Get all saved payment cards for user' })
  @ApiResponse({ status: 200, description: 'List of saved cards' })
  async getPaymentMethods(@Req() req: ReqWithUser) {
    const firebaseUid = req.user.uid;
    return this.paymentService.getPaymentMethodsByUid(firebaseUid);
  }

  @Post('cards/setup-intent')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Create Setup Intent for adding a new card' })
  @ApiResponse({ status: 201, description: 'Setup Intent created' })
  async createSetupIntent(@Req() req: ReqWithUser) {
    const firebaseUid = req.user.uid;
    return this.paymentService.createSetupIntentByUid(firebaseUid);
  }

  @Post('cards/attach')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Attach payment method to customer' })
  @ApiResponse({ status: 201, description: 'Payment method attached' })
  async attachPaymentMethod(
    @Req() req: ReqWithUser,
    @Body() attachPaymentMethodDto: AttachPaymentMethodDto,
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.attachPaymentMethodByUid(
      firebaseUid,
      attachPaymentMethodDto.paymentMethodId,
    );
  }

  @Delete('cards/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Delete (detach) a payment method' })
  @ApiParam({ name: 'id', description: 'Payment Method ID' })
  @ApiResponse({ status: 200, description: 'Payment method deleted' })
  async detachPaymentMethod(
    @Req() req: ReqWithUser,
    @Param('id') paymentMethodId: string,
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.detachPaymentMethodByUid(firebaseUid, paymentMethodId);
  }

  @Put('cards/:id/default')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Set a card as default payment method' })
  @ApiParam({ name: 'id', description: 'Payment Method ID' })
  @ApiResponse({ status: 200, description: 'Default payment method updated' })
  async setDefaultPaymentMethod(
    @Req() req: ReqWithUser,
    @Param('id') paymentMethodId: string,
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.setDefaultPaymentMethodByUid(firebaseUid, paymentMethodId);
  }

  // Generic routes with parameters must be LAST
  @Get(':id')
  async getPaymentById(@Param('id') id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @Post('topup-balance')
  @UseGuards(FirebaseAuthGuard)
  async topUpBalance(
    @Req() req: ReqWithUser,
    @Body() topUpBalanceDto: TopUpBalanceDto,
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.topUpBalance({
      ...topUpBalanceDto,
      userId: firebaseUid,
    });
  }

  @Post('pay-with-balance')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Pay for delivery using account balance' })
  @ApiResponse({ status: 200, description: 'Payment successful' })
  async payWithBalance(
    @Req() req: ReqWithUser,
    @Body() body: { amount: number; deliveryId: number; toUserId?: string; description?: string },
  ) {
    const firebaseUid = req.user.uid;
    return this.paymentService.payWithBalance(
      firebaseUid,
      body.amount,
      body.deliveryId,
      body.toUserId,
      body.description,
    );
  }
}
