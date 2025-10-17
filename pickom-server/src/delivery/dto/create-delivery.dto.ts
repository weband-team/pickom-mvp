import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  placeId?: string;
}

// DTO для создания новой доставки
// Используется когда отправитель (sender) создаёт заявку на доставку
export class CreateDeliveryDto {
  // Название посылки (обязательное поле)
  // Пример: "Документы", "Цветы", "Телефон"
  @IsString()
  @IsNotEmpty()
  title: string;

  // Описание посылки (необязательное поле)
  // Пример: "Хрупкое, осторожно", "Нужна доставка до 18:00"
  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsNotEmpty()
  fromLocation: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsNotEmpty()
  toLocation: LocationDto;

  @IsEnum(['within-city', 'inter-city'])
  @IsOptional()
  deliveryType?: 'within-city' | 'inter-city';

  @IsNumber()
  @Min(0)
  price: number;

  // Размер посылки (обязательное поле)
  // Может быть: 'small' (маленькая), 'medium' (средняя), 'large' (большая)
  @IsEnum(['small', 'medium', 'large'])
  size: 'small' | 'medium' | 'large';

  // Вес посылки в кг (необязательное поле)
  // Пример: 2.5
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  // Дополнительные заметки (необязательное поле)
  // Пример: "Позвонить за 10 минут"
  @IsString()
  @IsOptional()
  notes?: string;

  // UID курьера из Firebase (необязательное поле)
  // Если указан, то доставка назначается конкретному курьеру
  // Если не указан, то доставка в статусе "pending" и любой курьер может взять
  @IsString()
  @IsOptional()
  pickerId?: string;

  // UID получателя из Firebase (необязательное поле)
  // Если указан, получатель получит уведомление о доставке
  @IsString()
  @IsOptional()
  recipientId?: string;

  // Статус доставки (необязательное поле)
  // Если не указан, то по умолчанию будет 'pending'
  // Может быть: 'pending', 'accepted', 'picked_up', 'delivered', 'cancelled'
  @IsEnum(['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
}
