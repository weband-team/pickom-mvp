import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './create-delivery.dto';

// DTO for updating existing delivery
// All fields optional - can update only needed fields
export class UpdateDeliveryDto {
  // Package title (optional)
  @IsString()
  @IsOptional()
  title?: string;

  // Package description (optional)
  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsOptional()
  fromLocation?: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  @IsOptional()
  toLocation?: LocationDto;

  @IsEnum(['within-city', 'inter-city'])
  @IsOptional()
  deliveryType?: 'within-city' | 'inter-city';

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  // Package size (optional)
  @IsEnum(['small', 'medium', 'large'])
  @IsOptional()
  size?: 'small' | 'medium' | 'large';

  // Package weight in kg (optional)
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  // Additional notes (optional)
  @IsString()
  @IsOptional()
  notes?: string;

  // Delivery status (optional)
  @IsEnum(['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  // Picker UID from Firebase (optional)
  @IsString()
  @IsOptional()
  pickerId?: string;

  // Recipient UID from Firebase (optional)
  @IsString()
  @IsOptional()
  recipientId?: string;
}
