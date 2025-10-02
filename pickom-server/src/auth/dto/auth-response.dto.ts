import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
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
    description: 'Роль пользователя',
    example: 'picker',
  })
  role: string;

  @ApiProperty({
    description: 'Дата последнего входа',
    example: '2024-01-01T00:00:00.000Z',
  })
  prevLoginAt: Date;

  @ApiProperty({
    description: 'Дата создания аккаунта',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Подтвержден ли email',
    example: true,
  })
  emailVerified: boolean;
}

export class MeResponseDto {
  @ApiProperty({
    description: 'Информация о пользователе',
    type: UserDto,
    required: false,
  })
  user?: UserDto | null;

  @ApiProperty({
    description: 'Сообщение о статусе',
    example: 'User data retrieved successfully',
  })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Сообщение об успешном выходе',
    example: 'Logged out successfully',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Сообщение об ошибке',
    example: 'Authorization token is missing',
  })
  message: string;

  @ApiProperty({
    description: 'Статус код ошибки',
    example: 400,
  })
  statusCode: number;
}
