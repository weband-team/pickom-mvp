import { CanActivate, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';
import 'dotenv/config';
export type ReqWithUser = Request & {
    user?: {
        uid: string;
        email: string;
    } | null;
    token: string;
};
export declare class FirebaseAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class FirebaseAuthGuardMe implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
