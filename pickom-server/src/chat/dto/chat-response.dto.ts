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

  @ApiProperty({ required: false, nullable: true })
  senderId: string | null;

  @ApiProperty({ required: false, nullable: true })
  senderName: string | null;

  @ApiProperty()
  pickerId: string;

  @ApiProperty()
  pickerName: string;

  @ApiProperty({ required: false, nullable: true })
  recipientId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  recipientName?: string | null;

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
