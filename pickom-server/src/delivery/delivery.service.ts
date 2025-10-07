import { Injectable } from '@nestjs/common';
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

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  // Получить всех курьеров (role: 'picker')
  async getAvailablePickers(): Promise<User[]> {
    return await this.userService.findAllPickers();
  }

  // Создать запрос на доставку
  // Принимает UID отправителя и данные о доставке через DTO
  async createDeliveryRequest(
    senderUid: string,             // Firebase UID отправителя
    createDto: CreateDeliveryDto,  // Данные о доставке (title, address, price и т.д.)
  ): Promise<DeliveryDto> {
    // Найти отправителя по UID
    const sender = await this.userService.findOne(senderUid) as UserEntity;
    if (!sender) {
      throw new Error('Sender not found');
    }

    // Найти курьера по UID если указан
    let picker: UserEntity | null = null;
    if (createDto.pickerId) {
      picker = await this.userService.findOne(createDto.pickerId) as UserEntity;
      if (!picker) {
        throw new Error('Picker not found');
      }
    }

    // Найти получателя по UID если указан
    let recipient: UserEntity | null = null;
    if (createDto.recipientId) {
      recipient = await this.userService.findOne(createDto.recipientId) as UserEntity;
      if (!recipient) {
        throw new Error('Recipient not found');
      }
    }

    // Создаём новую сущность доставки
    const delivery = new Delivery();
    delivery.senderId = sender.id;
    delivery.pickerId = picker?.id || null;
    delivery.recipientId = recipient?.id || null;
    delivery.title = createDto.title;
    delivery.description = createDto.description || null;
    delivery.fromAddress = createDto.fromAddress;
    delivery.toAddress = createDto.toAddress;
    delivery.price = createDto.price;
    delivery.size = createDto.size;
    delivery.weight = createDto.weight || null;
    delivery.notes = createDto.notes || null;
    delivery.status = createDto.status || 'pending';

    // Сохраняем в базу данных
    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Если указан получатель, создаем уведомление о входящей доставке
    if (createDto.recipientId) {
      await this.notificationService.notifyIncomingDelivery(
        createDto.recipientId,
        savedDelivery.id,
        sender.name,
      );
    }

    // Преобразуем в DTO для возврата
    return this.toDto(savedDelivery, senderUid, createDto.pickerId, createDto.recipientId);
  }

  async getAllDeliveredDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    // Получить доставки в зависимости от роли
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

    // Преобразовать в DTO
    return deliveries.map((delivery) => this.entityToDto(delivery));
  }

  async getAllCancelledDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    // Получить доставки в зависимости от роли
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

    // Преобразовать в DTO
    return deliveries.map((delivery) => this.entityToDto(delivery));
  }

  async getAllDeliveryRequests(
    uid: string,
    role: string,
  ): Promise<DeliveryDto[]> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
    if (!user) {
      throw new Error('User not found');
    }

    // Получить доставки в зависимости от роли
    let deliveries: Delivery[];
    if (role === 'sender') {
      deliveries = await this.deliveryRepository.find({
        where: { senderId: user.id },
        relations: ['sender', 'picker', 'recipient'],
      });
    } else {
      deliveries = await this.deliveryRepository.find({
        where: { pickerId: user.id },
        relations: ['sender', 'picker', 'recipient'],
      });
    }

    // Преобразовать в DTO
    return deliveries.map((delivery) => this.entityToDto(delivery));
  }

  // Получить запрос по ID
  async getDeliveryRequestById(
    id: number,
    uid: string,
    role: string,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
    if (!user) {
      return null;
    }

    // Найти доставку
    const delivery = await this.deliveryRepository.findOne({
      where: { id,  },
      relations: ['sender', 'picker', 'recipient'],
    });

    if (!delivery) {
      return null;
    }

    // Проверить доступ
    if (role === 'sender' && delivery.senderId !== user.id) {
      return null;
    }
    if (role === 'picker' && delivery.pickerId !== user.id) {
      return null;
    }

    return this.entityToDto(delivery);
  }

  // Обновить статус запроса
  async updateDeliveryRequestStatus(
    id: number,
    status: 'accepted' | 'picked_up' | 'delivered' | 'cancelled',
    uid: string,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
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

    // Обновить статус
    delivery.status = status;
    await this.deliveryRepository.save(delivery);

    // Создаем уведомления при изменении статуса
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

    return this.entityToDto(delivery);
  }

  // Обновить данные доставки
  // Позволяет обновить любые поля доставки (title, description, address, price и т.д.)
  async updateDelivery(
    id: number,
    uid: string,
    updateDto: UpdateDeliveryDto,
  ): Promise<DeliveryDto | null> {
    // Найти пользователя по UID
    const user = await this.userService.findOne(uid) as UserEntity;
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
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.fromAddress !== undefined) updateData.fromAddress = updateDto.fromAddress;
    if (updateDto.toAddress !== undefined) updateData.toAddress = updateDto.toAddress;
    if (updateDto.price !== undefined) updateData.price = updateDto.price;
    if (updateDto.size !== undefined) updateData.size = updateDto.size;
    if (updateDto.weight !== undefined) updateData.weight = updateDto.weight;
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
    if (updateDto.status !== undefined) updateData.status = updateDto.status;

    // Обновить курьера, если указан
    if (updateDto.pickerId !== undefined) {
      if (updateDto.pickerId) {
        const picker = await this.userService.findOne(updateDto.pickerId) as UserEntity;
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
        const recipient = await this.userService.findOne(updateDto.recipientId) as UserEntity;
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

    return this.entityToDto(updatedDelivery!);
  }

  // Преобразовать Entity в DTO
  private entityToDto(delivery: Delivery): DeliveryDto {
    return {
      id: delivery.id,
      senderId: delivery.sender?.uid || null,
      pickerId: delivery.picker?.uid || null,
      recipientId: delivery.recipient?.uid || null,
      title: delivery.title,
      description: delivery.description,
      fromAddress: delivery.fromAddress,
      toAddress: delivery.toAddress,
      price: delivery.price,
      size: delivery.size,
      weight: delivery.weight,
      status: delivery.status,
      notes: delivery.notes,
      deliveriesUrl: delivery.deliveriesUrl,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }

  // Вспомогательный метод для создания DTO (используется в createDeliveryRequest)
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
      title: delivery.title,
      description: delivery.description,
      fromAddress: delivery.fromAddress,
      toAddress: delivery.toAddress,
      price: delivery.price,
      size: delivery.size,
      weight: delivery.weight,
      status: delivery.status,
      notes: delivery.notes,
      deliveriesUrl: delivery.deliveriesUrl,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }
}
