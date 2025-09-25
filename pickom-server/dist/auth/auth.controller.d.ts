import { Response, Request } from 'express';
import { ReqWithUser } from './guards/firebase-auth.guard';
import { AuthService } from './auth.service';
import { LoginBodyDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    login(req: Request, res: Response, authorization?: string, body?: LoginBodyDto): Promise<{
        uid: string;
        email: string;
        name: string;
        avatarUrl?: string;
        role: string;
        prevLoginAt: Date;
        createdAt: Date;
        updatedAt: Date;
        phone?: string;
    }>;
    me(req: ReqWithUser): Promise<{
        user: null;
        message: string;
    } | {
        user: {
            uid: string;
            email: string;
            name: string;
            avatarUrl?: string;
            role: string;
            prevLoginAt: Date;
            createdAt: Date;
            updatedAt: Date;
            phone?: string;
        };
        message: string;
    }>;
    logout(req: ReqWithUser, res: Response): Promise<{
        message: string;
    }>;
}
