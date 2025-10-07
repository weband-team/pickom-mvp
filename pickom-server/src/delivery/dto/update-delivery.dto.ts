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

  // Адрес откуда забрать посылку (необязательное поле)
  @IsString()
  @IsOptional()
  fromAddress?: string;

  // Адрес куда доставить посылку (необязательное поле)
  @IsString()
  @IsOptional()
  toAddress?: string;

  // Цена доставки (необязательное поле)
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
