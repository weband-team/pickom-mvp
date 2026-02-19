import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class TopUpBalanceDto {
  @IsString()
  userId: string; // Firebase UID

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
