import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindReceiverDto {
  @ApiProperty({
    description: 'Email of the receiver',
    example: 'receiver@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
