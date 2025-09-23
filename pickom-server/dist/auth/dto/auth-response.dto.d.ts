export declare class UserDto {
    uid: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    prevLoginAt: Date;
    createdAt: Date;
    emailVerified: boolean;
}
export declare class MeResponseDto {
    user?: UserDto | null;
    message: string;
}
export declare class LogoutResponseDto {
    message: string;
}
export declare class ErrorResponseDto {
    message: string;
    statusCode: number;
}
