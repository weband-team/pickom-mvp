import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'JWT access token from Firebase',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  authorization: string;
}

export class LoginBodyDto {
  role?: string;
  phone?: string;
  name: string;
}

export class LoginResponseDto {
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
    description: 'Email verified',
    example: true,
  })
  emailVerified: boolean;
}
