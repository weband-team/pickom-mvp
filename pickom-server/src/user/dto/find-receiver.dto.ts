import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindReceiverDto {
  @ApiProperty({
    description: 'Email or Firebase UID of the receiver',
    example: 'receiver@example.com',
  })
  @IsString()
  @IsNotEmpty()
  emailOrUid: string;
}
