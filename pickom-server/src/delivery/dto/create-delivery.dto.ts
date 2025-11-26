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

export class LocationDto {
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

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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

  @IsEnum(['small', 'medium', 'large'])
  size: 'small' | 'medium' | 'large';

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  pickerId?: string;

  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsEnum(['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  @IsString()
  @IsOptional()
  packageImageUrl?: string;
}
