import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @IsOptional()
  deliveryId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  fromUserId?: number;

  @IsOptional()
  toUserId?: number | string; // Can be database ID (number) or Firebase UID (string)

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
