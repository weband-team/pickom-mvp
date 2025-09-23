import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { UserService } from '../user/user.service';
import { User } from '../user/types/user.type';
export declare class AuthService {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService);
    verifyAndUpsertUser(accessToken: string, role?: string, name?: string, phone?: string): Promise<{
        decodedToken: DecodedIdToken;
        userInfo: User;
    }>;
    createSessionCookie(accessToken: string): Promise<{
        sessionCookie: string;
        expiresIn: number;
    }>;
    getUserInfo(uid: string): Promise<User>;
    createFirebaseToken(uid: string): Promise<string>;
    revokeToken(sessionCookie: string): Promise<void>;
    generateEmailVerificationLink(email: string): Promise<string>;
    generatePasswordResetLink(email: string): Promise<string>;
    getAvatarSize(url: string, provider: string): string;
}
