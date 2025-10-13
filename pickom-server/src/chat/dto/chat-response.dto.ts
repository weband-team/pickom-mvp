import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatSessionId: string;

  @ApiProperty()
  senderId: string; // Firebase UID

  @ApiProperty()
  senderName: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  attachments?: string[];

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class ChatSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  deliveryId?: number;

  @ApiProperty()
  senderId: string; // Firebase UID

  @ApiProperty()
  senderName: string;

  @ApiProperty()
  pickerId: string; // Firebase UID

  @ApiProperty()
  pickerName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [MessageDto], required: false })
  messages?: MessageDto[];

  @ApiProperty({ required: false })
  lastMessage?: MessageDto;

  @ApiProperty({ required: false })
  unreadCount?: number;
}
