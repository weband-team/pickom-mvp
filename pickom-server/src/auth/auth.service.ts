import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { admin } from './firebase-admin.module';
import { UserService } from '../user/user.service';
import { User } from '../user/types/user.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
  ) { }

  public async verifyAndUpsertUser(
    accessToken: string,
    role?: string,
    name?: string,
    phone?: string,
  ): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: User;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const avatar = this.getAvatarSize(decodedToken.picture || '', decodedToken.firebase.sign_in_provider);
    let userInfo = await this.userService.findOne(decodedToken.uid);
    if (!userInfo) {
      userInfo = await this.userService.create({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name: name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Unknown'),
        prevLoginAt: new Date(),
        avatarUrl: avatar,
        phone: phone,
        createdAt: new Date(),
        role: role ?? 'sender',
      });
    } else {
      userInfo = await this.userService.update(userInfo.uid, {
        prevLoginAt: new Date(),
        avatarUrl: avatar || userInfo.avatarUrl,
      });
    }

    return {
      decodedToken: decodedToken,
      userInfo,
    };
  }

  public async createSessionCookie(accessToken: string): Promise<{
    sessionCookie: string;
    expiresIn: number;
  }> {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await admin.auth().createSessionCookie(accessToken, {
      expiresIn,
    });

    return { sessionCookie, expiresIn };
  }

  public async getUserInfo(uid: string): Promise<User> {
    const userInfo = await this.userService.findOne(uid);
    if (!userInfo) {
      throw new Error('User not found');
    }

    return userInfo;
  }

  public async createFirebaseToken(uid: string): Promise<string> {
    const firebaseToken = await admin.auth().createCustomToken(uid);
    return firebaseToken;
  }

  public async revokeToken(sessionCookie: string): Promise<void> {
    try {
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      await admin.auth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException('You\'re not authorized to access this resource');
      }
      this.logger.error(`Error revoking token: ${error}`);
      throw new BadRequestException('Error revoking token');
    }
  }

  async generateEmailVerificationLink(email: string): Promise<string> {
    const actionCodeSettings = {
      url: `${process.env.CLIENT_URI || 'http://localhost:3000'}/profile?emailverified=true`,
    };
    return await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    const actionCodeSettings = {
      url: process.env.CLIENT_URI || 'http://localhost:3000',
    };
    return await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
  }

  public getAvatarSize(url: string, provider: string) {
    if (provider === 'google.com') {
      return url.replace(/=s\d+-c$/, '=s150-c');
    }
    return url;
  }
}
