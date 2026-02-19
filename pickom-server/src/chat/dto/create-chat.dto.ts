import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    description: 'Firebase UID of the other participant',
    example: 'abc123def456',
  })
  @IsString()
  participantId: string;

  @ApiProperty({
    description: 'Delivery ID associated with this chat (optional)',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  deliveryId?: number;
}
