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

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  // Получить всех курьеров (role: 'picker')
  async getAvailablePickers(): Promise<User[]> {
    return await this.userService.findAllPickers();
  }

  // Создать запрос на доставку
  // Принимает UID отправителя и данные о доставке через DTO
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

    // Сохраняем в базу данных
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Если указан получатель, создаем уведомление о входящей доставке
    if (recipient) {
      await this.notificationService.notifyIncomingDelivery(
        recipient.uid,
        savedDelivery.id,
        sender.name,
      );
    }

    // Преобразуем в DTO для возврата
    return this.toDto(
      savedDelivery,
      senderUid,
      createDto.pickerId,
      recipient?.uid,
    );
  }

  // Получить список всех запросов
  async getAllDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    // Найти пользователя по UID
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

    // Преобразовать в DTO
    return Promise.all(
      deliveries.map((delivery) => this.entityToDto(delivery)),
    );
  }

  // Получить запрос по ID
  async getDeliveryRequestById(
    id: number,
    uid: string,
    role: string,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Найти доставку
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

  // Обновить статус запроса
  async updateDeliveryRequestStatus(
    id: number,
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    uid: string,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Найти доставку
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Проверить права (только курьер может менять статус)
    if (delivery.pickerId !== user.id) {
      return null;
    }

    delivery.status = status;
    await this.deliveryRepository.save(delivery);

    if (status === 'accepted') {
      if (delivery.sender) {
        await this.userService.subtractFromBalance(
          delivery.sender.uid,
          Number(delivery.price),
        );
      }

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
      await this.userService.addToBalance(
        delivery.picker.uid,
        Number(delivery.price),
      );
    }
    const statusMessages: Record<string, string> = {
      picked_up: 'Курьер забрал вашу посылку и направляется к получателю.',
      delivered: 'Ваша посылка успешно доставлена!',
      cancelled: 'Доставка была отменена.',
    };

    const message = statusMessages[status];
    if (message) {
      // Уведомление для отправителя (используем UID)
      await this.notificationService.notifyStatusUpdate(
        delivery.sender.uid,
        id,
        status,
        message,
      );

      // Уведомление для получателя (если указан)
      if (delivery.recipient) {
        const recipientMessages: Record<string, string> = {
          picked_up: 'Курьер забрал посылку и направляется к вам.',
          delivered: 'Посылка доставлена к вам!',
          cancelled: 'Доставка посылки была отменена.',
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

  // Обновить данные доставки
  // Позволяет обновить любые поля доставки (title, description, address, price и т.д.)
  async updateDelivery(
    id: number,
    uid: string,
    updateDto: UpdateDeliveryDto,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = (await this.userService.findOne(uid)) as UserEntity;
    if (!user) {
      return null;
    }

    // Найти доставку
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Проверить права (только отправитель может редактировать)
    if (delivery.senderId !== user.id) {
      return null;
    }

    // Подготовить данные для обновления
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

    // Обновить курьера, если указан
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

    // Обновить получателя, если указан
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
}
