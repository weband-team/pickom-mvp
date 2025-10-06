import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { CreatePaymentIntentDto } from './dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createPaymentIntent(
    userId: number,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { amount, deliveryId, description, currency = 'usd' } = createPaymentIntentDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found. Please create a user first.`);
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      description: description || (deliveryId ? `Payment for delivery #${deliveryId}` : 'Test payment'),
      metadata: {
        ...(deliveryId && { deliveryId: deliveryId.toString() }),
        userId: userId.toString(),
      },
    });

    // Save payment to database
    const payment = this.paymentRepository.create({
      fromUserId: userId,
      toUserId: null, // Will be set when delivery is accepted
      deliveryId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      description,
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    const savedPayment = await this.paymentRepository.save(payment);

    return {
      paymentId: savedPayment.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async createCheckoutSession(
    userId: number,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const { amount, deliveryId, description, currency = 'usd' } = createPaymentIntentDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with id ${userId} not found. Please create a user first.`);
    }

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || (deliveryId ? `Оплата доставки #${deliveryId}` : 'Тестовый платеж'),
              description: deliveryId ? `Доставка #${deliveryId}` : undefined,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>('CLIENT_URI')}/test-payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('CLIENT_URI')}/test-payment`,
      metadata: {
        ...(deliveryId && { deliveryId: deliveryId.toString() }),
        userId: userId.toString(),
      },
    });

    // Save payment to database (payment_intent will be updated via webhook)
    const payment = this.paymentRepository.create({
      fromUserId: userId,
      toUserId: null,
      deliveryId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: 'stripe',
      stripePaymentIntentId: null, // Will be set via webhook
      stripeClientSecret: null, // Will be set via webhook
      description,
      metadata: {
        sessionId: session.id,
      },
    });

    await this.paymentRepository.save(payment);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
    } else if (paymentIntent.status === 'canceled') {
      payment.status = 'cancelled';
    } else if (
      paymentIntent.status === 'processing' ||
      paymentIntent.status === 'requires_action'
    ) {
      payment.status = 'processing';
    } else {
      payment.status = 'failed';
    }

    await this.paymentRepository.save(payment);

    return payment;
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Handling checkout.session.completed:', session.id);

    // Find payment by session ID in metadata
    const payments = await this.paymentRepository.find();
    const payment = payments.find(p => p.metadata?.sessionId === session.id);

    if (payment) {
      console.log('Found payment:', payment.id);

      // Get payment intent details to retrieve client_secret
      const paymentIntentId = session.payment_intent as string;
      if (paymentIntentId) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

        payment.stripePaymentIntentId = paymentIntent.id;
        payment.stripeClientSecret = paymentIntent.client_secret;
        payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 'processing';

        await this.paymentRepository.save(payment);
        console.log('Payment updated:', payment.id, 'Status:', payment.status);
      }
    } else {
      console.log('Payment not found for session:', session.id);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Handling payment_intent.succeeded:', paymentIntent.id);

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'completed';
      payment.stripeClientSecret = payment.stripeClientSecret || paymentIntent.client_secret;
      await this.paymentRepository.save(payment);
      console.log('Payment marked as completed:', payment.id);
    } else {
      console.log('Payment not found for payment_intent:', paymentIntent.id);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
    }
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      payment.status = 'cancelled';
      await this.paymentRepository.save(payment);
    }
  }

  async getPaymentsByUser(userId: number) {
    return this.paymentRepository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      relations: ['delivery', 'fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(paymentId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['delivery', 'fromUser', 'toUser'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
