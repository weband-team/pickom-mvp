import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ description: 'Delivery ID', example: 123 })
  @IsNumber()
  @IsNotEmpty()
  deliveryId: number;

  @ApiProperty({
    description: 'Firebase UID of user being rated',
    example: 'abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Great service!',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
