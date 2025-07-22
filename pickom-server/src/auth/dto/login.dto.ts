import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'JWT токен доступа от Firebase',
        example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    authorization: string;
}

export class LoginResponseDto {
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