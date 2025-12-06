import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'user_123456789',
  })
  uid: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User role in the system',
    example: 'picker',
    enum: ['picker', 'sender', 'moderator'],
  })
  role: string;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-01-01T00:00:00.000Z',
  })
  prevLoginAt: Date;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last profile update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User phone number',
    example: '+79999999999',
  })
  phone?: string;

  @ApiProperty({
    description: 'Online status',
    example: true,
    required: false,
  })
  isOnline?: boolean;

  @ApiProperty({
    description: 'Base delivery price (for pickers)',
    example: 15.0,
    required: false,
  })
  basePrice?: number;
}
