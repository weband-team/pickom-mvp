import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AttachPaymentMethodDto {
  @ApiProperty({
    description: 'Stripe Payment Method ID to attach to customer',
    example: 'pm_1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;
}
