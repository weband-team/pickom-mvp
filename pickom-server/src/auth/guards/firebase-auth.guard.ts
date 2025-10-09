import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type Request, type Response } from 'express';
import { admin } from '../firebase-admin.module';
import { User } from '../../user/entities/user.entity';
import 'dotenv/config';

export type ReqWithUser = Request & {
  user: {
    id: number;
    uid: string;
    email: string;
  };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
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

      // Load user from database by Firebase UID
      const user = await this.userRepository.findOne({
        where: { uid: decodedClaims.uid },
      });

      if (!user) {
        console.error('User not found in database for uid:', decodedClaims.uid);
        response.clearCookie('session', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return false;
      }

      request.user = {
        id: user.id,
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
