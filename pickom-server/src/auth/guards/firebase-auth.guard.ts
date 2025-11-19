import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { admin } from '../firebase-admin.module';
import 'dotenv/config';

export type ReqWithUser = Request & {
  user: {
    uid: string;
    email: string;
  };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ReqWithUser>();
    const response = context.switchToHttp().getResponse<Response>();
    const sessionCookie = request.cookies.session as string | undefined | null;
    const authHeader = request.headers.authorization as string | undefined;

    // Try session cookie first (for browser)
    if (sessionCookie) {
      try {
        const decodedClaims = await admin
          .auth()
          .verifySessionCookie(sessionCookie, true);
        if (!decodedClaims.email) {
          response.clearCookie('session', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          });
          return false;
        }

        request.user = {
          email: decodedClaims.email,
          uid: decodedClaims.uid,
        };

        return true;
      } catch (error) {
        console.error('Session cookie verification failed:', error);
        response.clearCookie('session', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        // Don't return false yet, try Bearer token next
      }
    }

    // Try Bearer token (for mobile apps)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decodedToken = await admin.auth().verifyIdToken(token, true);
        if (!decodedToken.email) {
          return false;
        }

        request.user = {
          email: decodedToken.email,
          uid: decodedToken.uid,
        };

        return true;
      } catch (error) {
        console.error('Bearer token verification failed:', error);
        return false;
      }
    }

    // Neither session cookie nor Bearer token present
    return false;
  }
}

// @Injectable()
// export class FirebaseAuthGuardMe implements CanActivate {
//   public async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<ReqWithUser>();
//     const response = context.switchToHttp().getResponse<Response>();
//     const sessionCookie = request.cookies.session as string | undefined | null;
//     if (!sessionCookie) {
//       request.user = null;
//       return true;
//     }

//     try {
//       const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
//       if (!decodedClaims.email) {
//         response.clearCookie('session', {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//         });
//         return false;
//       }

//       request.user = {
//         email: decodedClaims.email,
//         uid: decodedClaims.uid,
//       };

//       return true;
//     } catch (error) {
//       console.error(error);
//       response.clearCookie('session', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//       });
//       return false;
//     }
//   }
// }
