import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOfferDto {
  @IsEnum(['accepted', 'rejected'])
  @IsNotEmpty()
  status: 'accepted' | 'rejected';

  @IsEnum(['balance', 'card'])
  @IsOptional()
  paymentMethod?: 'balance' | 'card';

  @IsString()
  @IsOptional()
  paymentIntentId?: string;
}
