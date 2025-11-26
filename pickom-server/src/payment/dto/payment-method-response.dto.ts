import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodResponseDto {
  @ApiProperty({
    description: 'Stripe Payment Method ID',
    example: 'pm_1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Card brand (visa, mastercard, amex, discover, mir, etc.)',
    example: 'visa',
  })
  brand: string;

  @ApiProperty({
    description: 'Last 4 digits of the card',
    example: '4242',
  })
  lastFourDigits: string;

  @ApiProperty({
    description: 'Card expiration month',
    example: 12,
  })
  expMonth: number;

  @ApiProperty({
    description: 'Card expiration year',
    example: 2025,
  })
  expYear: number;

  @ApiProperty({
    description: 'Whether this card is set as default payment method',
    example: true,
  })
  isDefault: boolean;
}
