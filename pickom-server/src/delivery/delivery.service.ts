import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from './entities/delivery.entity';
import { DeliveryDto } from './dto/delivery.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { ChatService } from 'src/chat/chat.service';
import { Payment } from 'src/payment/entities/payment.entity';
import {
  calculateHaversineDistance,
  getRadiusByDeliveryType,
  estimateDeliveryTime,
} from 'src/utils/geo.utils';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  // Get all available pickers (role: 'picker')
  async getAvailablePickers(): Promise<User[]> {
    return await this.userService.findAllPickers();
  }

  // Get nearby pickers with distance calculation
  async getNearbyPickers(
    lat: number,
    lng: number,
    deliveryType: 'within-city' | 'suburban' | 'inter-city' = 'within-city',
  ): Promise<
    (User & {
      distance: number;
      estimatedTime: number;
    })[]
  > {
    const pickers = await this.userService.findAllPickers();
    const radius = getRadiusByDeliveryType(deliveryType);

    // Filter online pickers with location, calculate distance
    let pickersWithDistance = pickers
      .filter((picker) => picker.isOnline === true && picker.location)
      .map((picker) => {
        const distance = calculateHaversineDistance(
          lat,
          lng,
          picker.location.lat,
          picker.location.lng,
        );
        const estimatedTime = estimateDeliveryTime(distance);

        return {
          ...picker,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          estimatedTime,
          price: picker.basePrice || 15.0,
        };
      });

    // For inter-city deliveries, show all pickers sorted by distance
    // For other types, filter by radius
    if (deliveryType !== 'inter-city') {
      pickersWithDistance = pickersWithDistance.filter(
        (picker) => picker.distance <= radius,
      );
    }

    // Sort by distance ASC (closest first)
    pickersWithDistance.sort((a, b) => a.distance - b.distance);

    return pickersWithDistance;
  }

  // Create delivery request
  // Accepts sender UID and delivery data via DTO
  async createDeliveryRequest(
    senderUid: string,
    createDto: CreateDeliveryDto,
  ): Promise<DeliveryDto> {
    const sender = (await this.userService.findOne(senderUid)) as UserEntity;
    if (!sender) {
      throw new Error('Sender not found');
    }

    if (createDto.recipientEmail && createDto.recipientPhone) {
      throw new Error('Cannot specify both recipientEmail and recipientPhone');
    }

    let picker: UserEntity | null = null;
    if (createDto.pickerId) {
      picker = (await this.userService.findOne(
        createDto.pickerId,
      )) as UserEntity;
      if (!picker) {
        throw new Error('Picker not found');
      }
    }

    let recipient: UserEntity | null = null;
    if (createDto.recipientEmail) {
      // Validate that it's an email
      if (!createDto.recipientEmail.includes('@')) {
        throw new Error(
          `Invalid recipient email. Please provide a valid email address.`,
        );
      }

      const recipientData = await this.userService.findOneByEmail(
        createDto.recipientEmail,
      );
      if (!recipientData) {
        throw new Error(
          `Recipient with email "${createDto.recipientEmail}" not found in the system.`,
        );
      }
      recipient = recipientData;
    }

    const delivery = new Delivery();
    delivery.senderId = sender.id;
    delivery.pickerId = picker?.id || null;
    delivery.recipientId = recipient?.id || null;
    delivery.recipientPhone = createDto.recipientPhone || null;
    delivery.title = createDto.title;
    delivery.description = createDto.description || null;
    delivery.fromLocation = createDto.fromLocation;
    delivery.toLocation = createDto.toLocation;
    delivery.deliveryType = createDto.deliveryType || 'within-city';
    delivery.price = createDto.price;
    delivery.size = createDto.size;
    delivery.weight = createDto.weight || null;
    delivery.notes = createDto.notes || null;
    delivery.status = createDto.status || 'pending';
    delivery.packageImageUrl = createDto.packageImageUrl || null;

    // Save to database
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // If recipient specified, create notification about incoming delivery
    if (recipient) {
      await this.notificationService.notifyIncomingDelivery(
        recipient.uid,
        savedDelivery.id,
        sender.name,
      );
    }

    // Convert to DTO for return
    return this.toDto(
      savedDelivery,
      senderUid,
      createDto.pickerId,
      recipient?.uid,
    );
  }

  // Get list of all requests
  async getAllDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    // Find user by UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    let deliveries: Delivery[];
    const { Or } = await import('typeorm');

    if (role === 'sender') {
      // Show deliveries where user is sender OR recipient
      deliveries = await this.deliveryRepository.find({
        where: [{ senderId: user.id }, { recipientId: user.id }],
        relations: ['sender', 'picker', 'recipient'],
        order: { createdAt: 'DESC' },
      });
    } else if (role === 'picker') {
      const { IsNull } = await import('typeorm');
      deliveries = await this.deliveryRepository.find({
        where: [
          { pickerId: user.id },
          { status: 'pending', pickerId: IsNull() },
        ],
        relations: ['sender', 'picker', 'recipient'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // For any other role, show deliveries where user is recipient
      deliveries = await this.deliveryRepository.find({
        where: { recipientId: user.id },
        relations: ['sender', 'picker', 'recipient'],
        order: { createdAt: 'DESC' },
      });
    }

    // Convert to DTO
    return Promise.all(
      deliveries.map((delivery) => this.entityToDto(delivery)),
    );
  }

  // Get request by ID
  async getDeliveryRequestById(
    id: number,
    uid: string,
    role: string,
  ): Promise<DeliveryDto | null> {
    // Find user by UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Find delivery
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    const isSender = delivery.senderId === user.id;
    const isPicker = delivery.pickerId === user.id;
    const isRecipient = delivery.recipientId === user.id;
    const isPendingAvailable =
      delivery.status === 'pending' && delivery.pickerId === null;

    // Sender role can access if they are sender OR recipient
    if (role === 'sender' && !isSender && !isRecipient) {
      return null;
    }

    // Picker can access if they are assigned or if delivery is pending and available
    if (role === 'picker' && !isPicker && !isPendingAvailable) {
      return null;
    }

    // Final check: user must be sender, picker, recipient, or viewing pending delivery
    if (!isSender && !isPicker && !isRecipient && !isPendingAvailable) {
      return null;
    }

    return await this.entityToDto(delivery);
  }

  // Update request status
  async updateDeliveryRequestStatus(
    id: number,
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    uid: string,
  ): Promise<DeliveryDto | null> {
    // Find user by UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Find delivery
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Check permissions (only picker can change status)
    if (delivery.pickerId !== user.id) {
      return null;
    }

    delivery.status = status;
    await this.deliveryRepository.save(delivery);

    if (status === 'accepted') {
      // Balance deduction is handled by offer acceptance flow via /payment/pay-with-balance
      // Do NOT deduct balance here to avoid double deduction

      // Create chat between sender and picker
      console.log('[DeliveryService] Creating chat between picker and sender', {
        pickerUid: user.uid,
        senderUid: delivery.sender.uid,
        deliveryId: delivery.id,
      });
      const senderChat = await this.chatService.createChat(user.uid, {
        participantId: delivery.sender.uid,
        deliveryId: delivery.id,
      });
      console.log('[DeliveryService] Created sender chat:', senderChat);

      // Create chat between picker and receiver (if receiver exists)
      if (delivery.recipient) {
        console.log(
          '[DeliveryService] Creating chat between picker and receiver',
          {
            pickerUid: user.uid,
            recipientUid: delivery.recipient.uid,
            deliveryId: delivery.id,
          },
        );
        const receiverChat = await this.chatService.createChat(user.uid, {
          participantId: delivery.recipient.uid,
          deliveryId: delivery.id,
        });
        console.log('[DeliveryService] Created receiver chat:', receiverChat);
      } else {
        console.log('[DeliveryService] No recipient for delivery', delivery.id);
      }
    }

    if (status === 'delivered' && delivery.picker) {
      // Find the pending payment for this delivery and complete it
      const pendingPayment = await this.paymentRepository.findOne({
        where: {
          deliveryId: delivery.id,
          status: 'pending',
        },
        order: { createdAt: 'DESC' },
      });

      if (pendingPayment) {
        // Transfer funds to picker in a transaction
        await this.paymentRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Increment picker's balance
            await transactionalEntityManager.increment(
              UserEntity,
              { id: delivery.picker.id },
              'balance',
              Number(delivery.price),
            );

            // Mark payment as completed
            pendingPayment.status = 'completed';
            await transactionalEntityManager.save(Payment, pendingPayment);
          },
        );
        console.log(
          `[DeliveryService] Delivery ${delivery.id} completed, transferred $${delivery.price} to picker ${delivery.picker.uid}`,
        );
      } else {
        console.warn(
          `[DeliveryService] No pending payment found for delivery ${delivery.id}`,
        );
      }
    }
    const statusMessages: Record<string, string> = {
      picked_up: 'The picker has collected your package and is heading to the recipient.',
      delivered: 'Your package has been successfully delivered!',
      cancelled: 'The delivery was cancelled.',
    };

    const message = statusMessages[status];
    if (message) {
      // Notification for sender (using UID)
      await this.notificationService.notifyStatusUpdate(
        delivery.sender.uid,
        id,
        status,
        message,
      );

      // Notification for recipient (if specified)
      if (delivery.recipient) {
        const recipientMessages: Record<string, string> = {
          picked_up: 'The picker has collected the package and is heading to you.',
          delivered: 'The package has been delivered to you!',
          cancelled: 'The package delivery was cancelled.',
        };

        const recipientMessage = recipientMessages[status];
        if (recipientMessage) {
          await this.notificationService.notifyStatusUpdate(
            delivery.recipient.uid,
            id,
            status,
            recipientMessage,
          );
        }
      }
    }

    return await this.entityToDto(delivery);
  }

  // Update delivery data
  // Allows updating any delivery fields (title, description, address, price, etc.)
  async updateDelivery(
    id: number,
    uid: string,
    updateDto: UpdateDeliveryDto,
  ): Promise<DeliveryDto | null> {
    // Find user by UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Find delivery
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Check permissions (only sender can edit)
    if (delivery.senderId !== user.id) {
      return null;
    }

    // Prepare data for update
    const updateData: Partial<Delivery> = {};

    if (updateDto.title !== undefined) updateData.title = updateDto.title;
    if (updateDto.description !== undefined)
      updateData.description = updateDto.description;
    if (updateDto.fromLocation !== undefined)
      updateData.fromLocation = updateDto.fromLocation;
    if (updateDto.toLocation !== undefined)
      updateData.toLocation = updateDto.toLocation;
    if (updateDto.deliveryType !== undefined)
      updateData.deliveryType = updateDto.deliveryType;
    if (updateDto.price !== undefined) updateData.price = updateDto.price;
    if (updateDto.size !== undefined) updateData.size = updateDto.size;
    if (updateDto.weight !== undefined) updateData.weight = updateDto.weight;
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
    if (updateDto.status !== undefined) updateData.status = updateDto.status;

    // Update picker if specified
    if (updateDto.pickerId !== undefined) {
      if (updateDto.pickerId) {
        const picker = (await this.userService.findOne(
          updateDto.pickerId,
        )) as UserEntity;
        if (picker) {
          updateData.pickerId = picker.id;
        }
      } else {
        updateData.pickerId = null;
      }
    }

    // Update recipient if specified
    if (updateDto.recipientId !== undefined) {
      if (updateDto.recipientId) {
        const recipient = (await this.userService.findOne(
          updateDto.recipientId,
        )) as UserEntity;
        if (recipient) {
          updateData.recipientId = recipient.id;
        }
      } else {
        updateData.recipientId = null;
      }
    }

    // Обновить доставку используя метод update
    await this.deliveryRepository.update(id, updateData);

    // Перезагрузить обновленную доставку с relations
    const updatedDelivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    return await this.entityToDto(updatedDelivery!);
  }

  async getIncomingDeliveries(userId: number): Promise<DeliveryDto[]> {
    const deliveries = await this.deliveryRepository.find({
      where: { recipientId: userId },
      relations: ['sender', 'picker', 'recipient'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      deliveries.map((delivery) =>
        this.toDto(
          delivery,
          delivery.sender.uid,
          delivery.picker?.uid,
          delivery.recipient?.uid,
        ),
      ),
    );
  }

  async confirmDeliveryByReceiver(
    deliveryId: number,
    receiverUid: string,
    dto: any, // ConfirmDeliveryDto
  ): Promise<DeliveryDto> {
    // Get delivery
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    // Validate receiver
    const receiver = (await this.userService.findOne(
      receiverUid,
    )) as UserEntity;
    if (!receiver || delivery.recipientId !== receiver.id) {
      throw new Error('Only the recipient can confirm this delivery');
    }

    // Validate status
    if (delivery.status !== 'picked_up') {
      throw new Error('Delivery must be picked up before confirmation');
    }

    // Handle issue report
    if (dto.reportIssue) {
      delivery.status = 'cancelled';
      delivery.notes = `Issue reported by receiver: ${dto.issueDescription}`;
      // TODO: Notify picker and sender about issue
    } else {
      // Confirm delivery
      delivery.status = 'delivered';
      delivery.recipientConfirmed = true;
      if (dto.notes) {
        delivery.notes = dto.notes;
      }

      // Notify picker
      if (delivery.picker) {
        await this.notificationService.notifyPickerConfirmed(
          delivery.picker.uid,
          delivery.id,
          receiver.name,
        );
      }
    }

    const saved = await this.deliveryRepository.save(delivery);

    return this.toDto(
      saved,
      delivery.sender.uid,
      delivery.picker?.uid,
      delivery.recipient?.uid,
    );
  }

  async getAllDeliveredDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    let deliveries: Delivery[];
    if (role === 'sender') {
      deliveries = await this.deliveryRepository.find({
        where: { senderId: user.id, status: 'delivered' },
        relations: ['sender', 'picker', 'recipient'],
      });
    } else {
      deliveries = await this.deliveryRepository.find({
        where: { pickerId: user.id, status: 'delivered' },
        relations: ['sender', 'picker', 'recipient'],
      });
    }

    return Promise.all(
      deliveries.map((delivery) => this.entityToDto(delivery)),
    );
  }

  async getAllCancelledDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    let deliveries: Delivery[];
    if (role === 'sender') {
      deliveries = await this.deliveryRepository.find({
        where: { senderId: user.id, status: 'cancelled' },
        relations: ['sender', 'picker', 'recipient'],
      });
    } else {
      deliveries = await this.deliveryRepository.find({
        where: { pickerId: user.id, status: 'cancelled' },
        relations: ['sender', 'picker', 'recipient'],
      });
    }

    return Promise.all(
      deliveries.map((delivery) => this.entityToDto(delivery)),
    );
  }

  // Confirm or reject delivery by recipient
  async confirmRecipient(
    id: number,
    uid: string,
    confirmed: boolean,
  ): Promise<DeliveryDto | null> {
    // Find user by UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Find delivery
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Check if user is the recipient
    if (delivery.recipientId !== user.id) {
      return null;
    }

    // If confirming
    if (confirmed) {
      delivery.recipientConfirmed = true;
      await this.deliveryRepository.save(delivery);

      // Notify sender that recipient confirmed
      if (delivery.sender) {
        await this.notificationService.createNotification({
          user_id: delivery.sender.uid,
          type: 'recipient_confirmed',
          title: 'Получатель подтвердил доставку',
          message: `${user.name} подтвердил готовность принять доставку`,
          read: false,
        });
      }
    } else {
      // If rejecting, cancel the delivery
      delivery.status = 'cancelled';
      await this.deliveryRepository.save(delivery);

      // Notify sender that recipient rejected
      if (delivery.sender) {
        await this.notificationService.createNotification({
          user_id: delivery.sender.uid,
          type: 'recipient_rejected',
          title: 'Получатель отклонил доставку',
          message: `${user.name} отклонил доставку. Заказ отменён.`,
          read: false,
        });
      }
    }

    return await this.entityToDto(delivery);
  }

  private async entityToDto(delivery: Delivery): Promise<DeliveryDto> {
    // Load UIDs if relations are not loaded
    let senderUid: string | null = delivery.sender?.uid || null;
    let pickerUid: string | null = delivery.picker?.uid || null;
    let recipientUid: string | null = delivery.recipient?.uid || null;

    // Fallback: load uid from User entity if relation not loaded
    if (!senderUid && delivery.senderId) {
      const sender = await this.userService.findById(delivery.senderId);
      senderUid = sender?.uid || null;
    }

    if (!pickerUid && delivery.pickerId) {
      const picker = await this.userService.findById(delivery.pickerId);
      pickerUid = picker?.uid || null;
    }

    if (!recipientUid && delivery.recipientId) {
      const recipient = await this.userService.findById(delivery.recipientId);
      recipientUid = recipient?.uid || null;
    }

    return {
      id: delivery.id,
      senderId: senderUid,
      pickerId: pickerUid,
      recipientId: recipientUid,
      recipientPhone: delivery.recipientPhone,
      recipientConfirmed: delivery.recipientConfirmed || false,
      title: delivery.title,
      description: delivery.description,
      fromLocation: delivery.fromLocation,
      toLocation: delivery.toLocation,
      deliveryType: delivery.deliveryType,
      price: Number(delivery.price),
      size: delivery.size,
      weight: delivery.weight ? Number(delivery.weight) : null,
      status: delivery.status,
      notes: delivery.notes,
      deliveriesUrl: delivery.deliveriesUrl,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }

  private toDto(
    delivery: Delivery,
    senderUid: string,
    pickerUid?: string,
    recipientUid?: string,
  ): DeliveryDto {
    return {
      id: delivery.id,
      senderId: senderUid,
      pickerId: pickerUid || null,
      recipientId: recipientUid || null,
      recipientPhone: delivery.recipientPhone,
      recipientConfirmed: delivery.recipientConfirmed || false,
      title: delivery.title,
      description: delivery.description,
      fromLocation: delivery.fromLocation,
      toLocation: delivery.toLocation,
      deliveryType: delivery.deliveryType,
      price: Number(delivery.price),
      size: delivery.size,
      weight: delivery.weight ? Number(delivery.weight) : null,
      status: delivery.status,
      notes: delivery.notes,
      deliveriesUrl: delivery.deliveriesUrl,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }

  async findOne(id: number): Promise<Delivery | null> {
    return await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });
  }

  async updateDeliveryPicker(
    deliveryId: number,
    pickerId: number,
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      throw new Error('Delivery not found');
    }

    delivery.pickerId = pickerId;
    delivery.status = status;

    return await this.deliveryRepository.save(delivery);
  }
}
