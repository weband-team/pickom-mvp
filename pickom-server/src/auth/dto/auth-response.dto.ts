import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
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
    description: 'User role',
    example: 'picker',
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
    description: 'Is email verified',
    example: true,
  })
  emailVerified: boolean;
}

export class MeResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserDto,
    required: false,
  })
  user?: UserDto | null;

  @ApiProperty({
    description: 'Status message',
    example: 'User data retrieved successfully',
  })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Successful logout message',
    example: 'Logged out successfully',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Authorization token is missing',
  })
  message: string;

  @ApiProperty({
    description: 'Error status code',
    example: 400,
  })
  statusCode: number;
}
