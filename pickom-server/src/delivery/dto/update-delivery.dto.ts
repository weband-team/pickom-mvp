import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

// DTO для обновления существующей доставки
// Все поля необязательные - можно обновить только нужные поля
export class UpdateDeliveryDto {
  // Название посылки (необязательное поле)
  @IsString()
  @IsOptional()
  title?: string;

  // Описание посылки (необязательное поле)
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fromAddress?: string;

  @IsString()
  @IsOptional()
  fromCity?: string;

  @IsString()
  @IsOptional()
  toAddress?: string;

  @IsString()
  @IsOptional()
  toCity?: string;

  @IsEnum(['within-city', 'inter-city'])
  @IsOptional()
  deliveryType?: 'within-city' | 'inter-city';

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  // Размер посылки (необязательное поле)
  @IsEnum(['small', 'medium', 'large'])
  @IsOptional()
  size?: 'small' | 'medium' | 'large';

  // Вес посылки в кг (необязательное поле)
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  // Дополнительные заметки (необязательное поле)
  @IsString()
  @IsOptional()
  notes?: string;

  // Статус доставки (необязательное поле)
  @IsEnum(['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  // UID курьера из Firebase (необязательное поле)
  @IsString()
  @IsOptional()
  pickerId?: string;

  // UID получателя из Firebase (необязательное поле)
  @IsString()
  @IsOptional()
  recipientId?: string;
}
