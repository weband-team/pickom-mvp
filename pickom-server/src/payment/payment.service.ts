import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import {
  CreatePaymentIntentDto,
  TopUpBalanceDto,
  PaymentMethodResponseDto,
  SetupIntentResponseDto,
} from './dto';
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
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createPaymentIntent(
    userId: number,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const {
      amount,
      deliveryId,
      description,
      currency = 'usd',
      fromUserId,
      toUserId,
    } = createPaymentIntentDto;
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(
        `User with id ${userId} not found. Please create a user first.`,
      );
    }

    // Validate fromUserId if provided
    if (fromUserId) {
      const fromUser = await this.userRepository.findOne({
        where: { id: fromUserId },
      });
      if (!fromUser) {
        throw new BadRequestException(
          `From user with id ${fromUserId} not found.`,
        );
      }
    }

    // Validate toUserId if provided
    let validatedToUserId: number | null = null;
    if (toUserId) {
      // Convert string (Firebase UID) to number (database ID) if necessary
      if (typeof toUserId === 'string') {
        const toUser = await this.userRepository.findOne({
          where: { uid: toUserId },
        });
        if (!toUser) {
          throw new BadRequestException(`To user with uid ${toUserId} not found.`);
        }
        validatedToUserId = toUser.id;
      } else {
        const toUser = await this.userRepository.findOne({
          where: { id: toUserId },
        });
        if (!toUser) {
          throw new BadRequestException(`To user with id ${toUserId} not found.`);
        }
        validatedToUserId = toUserId;
      }
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      description:
        description ||
        (deliveryId ? `Payment for delivery #${deliveryId}` : 'Test payment'),
      metadata: {
        ...(deliveryId && { deliveryId: deliveryId.toString() }),
        userId: userId.toString(),
      },
    });

    // Save payment to database
    const payment = this.paymentRepository.create({
      fromUserId: fromUserId || userId,
      toUserId: validatedToUserId, // Will be set when delivery is accepted
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
    const {
      amount,
      deliveryId,
      description,
      currency = 'usd',
      fromUserId,
      toUserId,
    } = createPaymentIntentDto;

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(
        `User with id ${userId} not found. Please create a user first.`,
      );
    }

    // Validate fromUserId if provided
    if (fromUserId) {
      const fromUser = await this.userRepository.findOne({
        where: { id: fromUserId },
      });
      if (!fromUser) {
        throw new BadRequestException(
          `From user with id ${fromUserId} not found.`,
        );
      }
    }

    // Validate toUserId if provided
    let validatedToUserId: number | null = null;
    if (toUserId) {
      // Convert string (Firebase UID) to number (database ID) if necessary
      if (typeof toUserId === 'string') {
        const toUser = await this.userRepository.findOne({
          where: { uid: toUserId },
        });
        if (!toUser) {
          throw new BadRequestException(`To user with uid ${toUserId} not found.`);
        }
        validatedToUserId = toUser.id;
      } else {
        const toUser = await this.userRepository.findOne({
          where: { id: toUserId },
        });
        if (!toUser) {
          throw new BadRequestException(`To user with id ${toUserId} not found.`);
        }
        validatedToUserId = toUserId;
      }
    }

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: deliveryId
                ? `Оплата доставки #${deliveryId}`
                : 'Тестовый платеж',
              description:
                description ||
                (deliveryId ? `Доставка #${deliveryId}` : undefined),
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
      payment_intent_data: {
        description:
          description ||
          (deliveryId ? `Payment for delivery #${deliveryId}` : 'Test payment'),
        metadata: {
          ...(deliveryId && { deliveryId: deliveryId.toString() }),
          userId: userId.toString(),
        },
      },
    });

    // Save payment to database (payment_intent will be updated via webhook)
    const payment = this.paymentRepository.create({
      fromUserId: fromUserId || userId,
      toUserId: validatedToUserId,
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
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
      );
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
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;
      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    console.log('Handling checkout.session.completed:', session.id);

    // Find payment by session ID in metadata
    const payments = await this.paymentRepository.find();
    const payment = payments.find((p) => p.metadata?.sessionId === session.id);

    if (payment) {
      console.log('Found payment:', payment.id);

      // Get payment intent details to retrieve client_secret
      const paymentIntentId = session.payment_intent as string;
      if (paymentIntentId) {
        const paymentIntent =
          await this.stripe.paymentIntents.retrieve(paymentIntentId);

        payment.stripePaymentIntentId = paymentIntent.id;
        payment.stripeClientSecret = paymentIntent.client_secret;
        payment.status =
          paymentIntent.status === 'succeeded' ? 'completed' : 'processing';

        // If payment succeeded, update balances in transaction
        if (paymentIntent.status === 'succeeded') {
          console.log(
            `Processing successful payment: ID=${payment.id}, fromUserId=${payment.fromUserId}, toUserId=${payment.toUserId}, amount=${payment.amount}`,
          );

          await this.paymentRepository.manager.transaction(
            async (transactionalEntityManager) => {
              // Save payment status
              await transactionalEntityManager.save(Payment, payment);

              // Check if this is a balance top-up
              const isTopUp = payment.metadata?.type === 'balance_topup';

              if (isTopUp) {
                // For balance top-up, only increment the user's balance
                console.log(
                  `Incrementing balance for user ${payment.toUserId} by ${payment.amount} (top-up)`,
                );
                await transactionalEntityManager.increment(
                  User,
                  { id: payment.toUserId },
                  'balance',
                  payment.amount,
                );
              } else {
                // For regular payments, decrement from sender and increment to receiver
                if (payment.fromUserId) {
                  console.log(
                    `Decrementing balance for user ${payment.fromUserId} by ${payment.amount}`,
                  );
                  await transactionalEntityManager.decrement(
                    User,
                    { id: payment.fromUserId },
                    'balance',
                    payment.amount,
                  );
                }

                if (payment.toUserId) {
                  console.log(
                    `Incrementing balance for user ${payment.toUserId} by ${payment.amount}`,
                  );
                  await transactionalEntityManager.increment(
                    User,
                    { id: payment.toUserId },
                    'balance',
                    payment.amount,
                  );
                }
              }
            },
          );

          console.log(
            'Payment marked as completed and balances updated:',
            payment.id,
          );
        } else {
          await this.paymentRepository.save(payment);
          console.log(
            'Payment updated:',
            payment.id,
            'Status:',
            payment.status,
          );
        }
      }
    } else {
      console.log('Payment not found for session:', session.id);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    console.log('Handling payment_intent.succeeded:', paymentIntent.id);

    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      console.log(
        `Processing payment: ID=${payment.id}, fromUserId=${payment.fromUserId}, toUserId=${payment.toUserId}, amount=${payment.amount}`,
      );

      // Use transaction to update payment and user balances atomically
      await this.paymentRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Update payment status
          payment.status = 'completed';
          payment.stripeClientSecret =
            payment.stripeClientSecret || paymentIntent.client_secret;
          await transactionalEntityManager.save(Payment, payment);

          // Check if this is a balance top-up
          const isTopUp = payment.metadata?.type === 'balance_topup';

          if (isTopUp) {
            // For balance top-up, only increment the user's balance
            console.log(
              `Incrementing balance for user ${payment.toUserId} by ${payment.amount} (top-up)`,
            );
            await transactionalEntityManager.increment(
              User,
              { id: payment.toUserId },
              'balance',
              payment.amount,
            );
          } else {
            // For regular payments, decrement from sender and increment to receiver
            if (payment.fromUserId) {
              console.log(
                `Decrementing balance for user ${payment.fromUserId} by ${payment.amount}`,
              );
              await transactionalEntityManager.decrement(
                User,
                { id: payment.fromUserId },
                'balance',
                payment.amount,
              );
            }

            if (payment.toUserId) {
              console.log(
                `Incrementing balance for user ${payment.toUserId} by ${payment.amount}`,
              );
              await transactionalEntityManager.increment(
                User,
                { id: payment.toUserId },
                'balance',
                payment.amount,
              );
            }
          }
        },
      );

      console.log(
        'Payment marked as completed and balances updated:',
        payment.id,
      );
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

  private async handlePaymentIntentCanceled(
    paymentIntent: Stripe.PaymentIntent,
  ) {
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

  /**
   * Get payments by Firebase UID
   */
  async getPaymentsByUserUid(firebaseUid: string) {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.getPaymentsByUser(userId);
  }

  /**
   * Create payment intent by Firebase UID
   */
  async createPaymentIntentByUid(
    firebaseUid: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.createPaymentIntent(userId, createPaymentIntentDto);
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

  async topUpBalance(topUpBalanceDto: TopUpBalanceDto) {
    const { userId, amount, description, paymentMethodId } = topUpBalanceDto;

    // Find user by Firebase UID
    const user = await this.userRepository.findOne({ where: { uid: userId } });
    if (!user) {
      throw new NotFoundException(`User with uid ${userId} not found`);
    }

    // If paymentMethodId is provided, charge the card directly
    if (paymentMethodId) {
      return this.topUpBalanceWithCard(user, amount, description, paymentMethodId);
    }

    // Otherwise, create Stripe Checkout Session for balance top-up
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Balance Top-Up',
              description:
                description || `Top-up balance for user ${user.name}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>('CLIENT_URI')}/test-balance-topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get<string>('CLIENT_URI')}/test-balance-topup`,
      metadata: {
        userId: user.id.toString(),
        type: 'balance_topup',
      },
      payment_intent_data: {
        description: description || `Balance top-up for user ${user.name}`,
        metadata: {
          userId: user.id.toString(),
          type: 'balance_topup',
        },
      },
    });

    // Save payment to database (will be updated via webhook)
    const payment = this.paymentRepository.create({
      fromUserId: user.id,
      toUserId: user.id, // For balance top-up, from and to are the same
      deliveryId: null,
      amount,
      currency: 'usd',
      status: 'pending',
      paymentMethod: 'stripe',
      stripePaymentIntentId: null, // Will be set via webhook
      stripeClientSecret: null, // Will be set via webhook
      description: description || 'Balance top-up',
      metadata: {
        sessionId: session.id,
        type: 'balance_topup',
      },
    });

    await this.paymentRepository.save(payment);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  // =====================
  // Payment Cards Methods
  // =====================

  /**
   * Helper method to get or create Stripe customer for a user
   * Bug #10 fix: Added database lock to prevent race condition
   */
  private async getOrCreateStripeCustomer(userId: number): Promise<string> {
    // Use transaction with pessimistic write lock to prevent race conditions
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Lock the user row for update (prevents concurrent modifications)
        const user = await transactionalEntityManager.findOne(User, {
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new NotFoundException(`User with id ${userId} not found`);
        }

        // If user already has a Stripe customer ID, return it
        if (user.stripeCustomerId) {
          return user.stripeCustomerId;
        }

        // Create new Stripe customer (outside of transaction, but row is locked)
        let customer: Stripe.Customer;
        try {
          customer = await this.stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user.id.toString(),
            },
          });
        } catch (error: any) {
          throw new BadRequestException(
            `Failed to create Stripe customer: ${error.message}`,
          );
        }

        // Save Stripe customer ID to user
        user.stripeCustomerId = customer.id;
        await transactionalEntityManager.save(User, user);

        return customer.id;
      },
    );
  }

  /**
   * Helper method to get user ID by Firebase UID
   */
  private async getUserIdByUid(firebaseUid: string): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { uid: firebaseUid },
    });
    if (!user) {
      throw new NotFoundException(`User with uid ${firebaseUid} not found`);
    }
    return user.id;
  }

  /**
   * Get all payment methods (saved cards) for a user
   */
  async getPaymentMethods(userId: number): Promise<PaymentMethodResponseDto[]> {
    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

    // Bug #4 fix: Get customer with default payment method in one call
    const customer = await this.stripe.customers.retrieve(stripeCustomerId);

    // List all payment methods for this customer
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    const defaultPaymentMethodId =
      !customer.deleted
        ? customer.invoice_settings?.default_payment_method
        : null;

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || 'unknown',
      lastFourDigits: pm.card?.last4 || '0000',
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: pm.id === defaultPaymentMethodId,
    }));
  }

  /**
   * Get all payment methods by Firebase UID
   */
  async getPaymentMethodsByUid(
    firebaseUid: string,
  ): Promise<PaymentMethodResponseDto[]> {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.getPaymentMethods(userId);
  }

  /**
   * Create Setup Intent for adding a new card
   */
  async createSetupIntent(userId: number): Promise<SetupIntentResponseDto> {
    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

    const setupIntent = await this.stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    if (!setupIntent.client_secret) {
      throw new BadRequestException(
        'Failed to create setup intent (No secret)',
      );
    }

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  }

  /**
   * Create Setup Intent by Firebase UID
   */
  async createSetupIntentByUid(
    firebaseUid: string,
  ): Promise<SetupIntentResponseDto> {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.createSetupIntent(userId);
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    userId: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

      // Bug #3 and #8 fix: Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      });

      return {
        success: true,
        message: 'Payment method attached successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to attach payment method: ${error.message}`,
      );
    }
  }

  /**
   * Attach payment method by Firebase UID
   */
  async attachPaymentMethodByUid(
    firebaseUid: string,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.attachPaymentMethod(userId, paymentMethodId);
  }

  /**
   * Detach (remove) payment method from customer
   */
  async detachPaymentMethod(
    userId: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Bug #5 and #7 fix: Verify ownership before detaching
    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

    const paymentMethod =
      await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
      throw new BadRequestException(
        'Payment method does not belong to this user',
      );
    }

    await this.stripe.paymentMethods.detach(paymentMethodId);

    return {
      success: true,
      message: 'Payment method removed successfully',
    };
  }

  /**
   * Detach payment method by Firebase UID
   */
  async detachPaymentMethodByUid(
    firebaseUid: string,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.detachPaymentMethod(userId, paymentMethodId);
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(
    userId: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Bug #6 and #7 fix: Verify ownership before setting as default
    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

    const paymentMethod =
      await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
      throw new BadRequestException(
        'Payment method does not belong to this user',
      );
    }

    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return {
      success: true,
      message: 'Default payment method updated successfully',
    };
  }

  /**
   * Set default payment method by Firebase UID
   */
  async setDefaultPaymentMethodByUid(
    firebaseUid: string,
    paymentMethodId: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = await this.getUserIdByUid(firebaseUid);
    return this.setDefaultPaymentMethod(userId, paymentMethodId);
  }

  /**
   * Top up balance with saved card (direct charge using Payment Intent)
   */
  private async topUpBalanceWithCard(
    user: User,
    amount: number,
    description: string | undefined,
    paymentMethodId: string,
  ): Promise<{ status: string; paymentIntentId?: string }> {
    try {
      // Get or create Stripe customer
      const stripeCustomerId = await this.getOrCreateStripeCustomer(user.id);

      // Create and confirm Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: 'usd',
        customer: stripeCustomerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: description || `Balance top-up for user ${user.name}`,
        metadata: {
          userId: user.id.toString(),
          type: 'balance_topup',
        },
      });

      // If payment succeeded, update balance immediately
      if (paymentIntent.status === 'succeeded') {
        await this.paymentRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Increment user balance
            await transactionalEntityManager.increment(
              User,
              { id: user.id },
              'balance',
              amount,
            );

            // Create payment record
            const payment = this.paymentRepository.create({
              fromUserId: user.id,
              toUserId: user.id,
              deliveryId: null,
              amount,
              currency: 'usd',
              status: 'completed',
              paymentMethod: 'stripe',
              stripePaymentIntentId: paymentIntent.id,
              stripeClientSecret: paymentIntent.client_secret,
              description: description || 'Balance top-up',
              metadata: {
                type: 'balance_topup',
                paymentMethodId,
              },
            });

            await transactionalEntityManager.save(Payment, payment);
          },
        );

        return {
          status: 'succeeded',
          paymentIntentId: paymentIntent.id,
        };
      }

      // If payment requires additional action (3D Secure)
      if (paymentIntent.status === 'requires_action') {
        return {
          status: 'requires_action',
          paymentIntentId: paymentIntent.id,
        };
      }

      // If payment is processing
      if (paymentIntent.status === 'processing') {
        // Create payment record as processing
        const payment = this.paymentRepository.create({
          fromUserId: user.id,
          toUserId: user.id,
          deliveryId: null,
          amount,
          currency: 'usd',
          status: 'processing',
          paymentMethod: 'stripe',
          stripePaymentIntentId: paymentIntent.id,
          stripeClientSecret: paymentIntent.client_secret,
          description: description || 'Balance top-up',
          metadata: {
            type: 'balance_topup',
            paymentMethodId,
          },
        });

        await this.paymentRepository.save(payment);

        return {
          status: 'processing',
          paymentIntentId: paymentIntent.id,
        };
      }

      // Payment failed or other status
      return {
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Payment failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Pay with balance (deduct from sender's balance)
   */
  async payWithBalance(
    firebaseUid: string,
    amount: number,
    deliveryId: number,
    toUserUid?: string,
    description?: string,
  ): Promise<{ success: boolean; paymentId: number; message: string }> {
    const user = await this.userRepository.findOne({
      where: { uid: firebaseUid },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      throw new Error(
        `Insufficient balance. You have $${user.balance.toFixed(2)} but need $${amount.toFixed(2)}`,
      );
    }

    // Get toUser ID if provided
    let toUserId: number | null = null;
    if (toUserUid) {
      const toUser = await this.userRepository.findOne({
        where: { uid: toUserUid },
      });
      if (toUser) {
        toUserId = toUser.id;
      }
    }

    // Use transaction to deduct balance and create payment record atomically
    return await this.paymentRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Deduct from sender's balance
        await transactionalEntityManager.decrement(
          User,
          { id: user.id },
          'balance',
          amount,
        );

        // If toUserId is provided, increment their balance immediately
        if (toUserId) {
          await transactionalEntityManager.increment(
            User,
            { id: toUserId },
            'balance',
            amount,
          );
        }

        // Create payment record
        const payment = this.paymentRepository.create({
          fromUserId: user.id,
          toUserId: toUserId,
          deliveryId,
          amount,
          currency: 'usd',
          status: 'completed',
          paymentMethod: 'balance',
          description:
            description || `Payment for delivery #${deliveryId} using balance`,
          metadata: {
            deliveryId: deliveryId.toString(),
            paymentSource: 'balance',
            type: 'delivery_payment',
          },
        });

        const savedPayment = await transactionalEntityManager.save(
          Payment,
          payment,
        );

        return {
          success: true,
          paymentId: savedPayment.id,
          message: 'Payment successful',
        };
      },
    );
  }
}
