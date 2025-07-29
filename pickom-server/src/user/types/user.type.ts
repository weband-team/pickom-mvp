import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'user_123456789',
  })
  uid: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  avatarUrl?: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    example: 'picker',
    enum: ['picker', 'sender', 'moderator'],
  })
  role: string;

  @ApiProperty({
    description: 'Дата последнего входа в систему',
    example: '2024-01-01T00:00:00.000Z',
  })
  prevLoginAt: Date;

  @ApiProperty({
    description: 'Дата создания аккаунта',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления профиля',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Номер телефона пользователя',
    example: '+79999999999',
  })
  phone?: string;
}