import { ApiProperty } from '@nestjs/swagger';

export class RatingDto {
  @ApiProperty({ description: 'Rating ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Delivery ID', example: 123 })
  deliveryId: number;

  @ApiProperty({
    description: 'Firebase UID of user who gave rating',
    example: 'sender123',
  })
  fromUserId: string;

  @ApiProperty({
    description: 'Firebase UID of user who received rating',
    example: 'picker456',
  })
  toUserId: string;

  @ApiProperty({
    description: 'Rating value (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: 'Optional comment',
    example: 'Excellent picker!',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-10-09T12:00:00Z',
  })
  createdAt: Date;
}
