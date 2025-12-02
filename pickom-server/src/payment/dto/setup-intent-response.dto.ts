import { ApiProperty } from '@nestjs/swagger';

export class SetupIntentResponseDto {
  @ApiProperty({
    description: 'Stripe Setup Intent client secret for confirming on client',
    example: 'seti_1234567890abcdef_secret_XYZ',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Stripe Setup Intent ID',
    example: 'seti_1234567890abcdef',
  })
  setupIntentId: string;
}
