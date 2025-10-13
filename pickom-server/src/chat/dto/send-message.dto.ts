import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello! I can pick up your package today.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Array of attachment URLs (optional)',
    example: ['https://example.com/image.jpg'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
