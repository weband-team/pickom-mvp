import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmDeliveryDto {
  @ApiProperty({
    description: 'Whether the receiver confirms receipt of the delivery',
    example: true,
  })
  @IsBoolean()
  confirmed: boolean;

  @ApiProperty({
    description: 'Optional notes from receiver',
    example: 'Package received in good condition',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Optional photo URL as proof of delivery',
    example: 'https://example.com/proof.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({
    description: 'Whether receiver is reporting an issue',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  reportIssue?: boolean;

  @ApiProperty({
    description: 'Description of issue if reportIssue is true',
    example: 'Package was damaged',
    required: false,
  })
  @IsString()
  @IsOptional()
  issueDescription?: string;
}
