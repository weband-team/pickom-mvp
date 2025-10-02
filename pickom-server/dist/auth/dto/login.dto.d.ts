export declare class LoginDto {
    authorization: string;
}
export declare class LoginBodyDto {
    role?: string;
    phone?: string;
    name: string;
}
export declare class LoginResponseDto {
    uid: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    prevLoginAt: Date;
    createdAt: Date;
    emailVerified: boolean;
}
