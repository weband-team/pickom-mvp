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

    if (!sessionCookie) return false;

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
      console.error(error);
      response.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      return false;
    }
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
