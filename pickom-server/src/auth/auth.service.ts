import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { admin } from './firebase-admin.module';
import { UserService } from '../user/user.service';
import { User } from '../user/types/user.type';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userService: UserService) {}

  public async verifyAndUpsertUser(
    accessToken: string,
    role?: string,
    name?: string,
    phone?: string,
  ): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserDto;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const avatar = this.getAvatarSize(
      decodedToken.picture || '',
      decodedToken.firebase.sign_in_provider,
    );
    let userInfo = await this.userService.findOne(decodedToken.uid);
    if (!userInfo) {
      userInfo = await this.userService.create({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        name:
          name ||
          (decodedToken.email ? decodedToken.email.split('@')[0] : 'Unknown'),
        prevLoginAt: new Date(),
        avatarUrl: avatar,
        phone: phone,
        createdAt: new Date(),
        role: (role as 'sender' | 'picker') ?? 'sender',
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

  /**
   * For LOGIN: Verify token and check user exists in DB
   */
  public async verifyAndLoginUser(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserDto;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const userInfo = await this.userService.findOne(decodedToken.uid);

    if (!userInfo) {
      throw new BadRequestException('User not found. Please register first.');
    }

    // Update last login time
    const updatedUser = await this.userService.update(userInfo.uid, {
      prevLoginAt: new Date(),
    });

    return {
      decodedToken: decodedToken,
      userInfo: updatedUser,
    };
  }

  /**
   * For REGISTER: Verify token and create user in DB (idempotent).
   * If user already exists in DB (e.g. Firebase user was created but DB insert
   * failed on a previous attempt), returns the existing user instead of throwing.
   */
  public async verifyAndCreateUser(
    accessToken: string,
    role: string,
    name?: string,
    phone?: string,
  ): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserDto;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const avatar = this.getAvatarSize(
      decodedToken.picture || '',
      decodedToken.firebase.sign_in_provider,
    );

    // If user already exists in DB, return them (handles partial registration recovery)
    const existingUser = await this.userService.findOne(decodedToken.uid);
    if (existingUser) {
      const updatedUser = await this.userService.update(existingUser.uid, {
        prevLoginAt: new Date(),
      });
      return {
        decodedToken,
        userInfo: updatedUser,
      };
    }

    // Create new user
    const userInfo = await this.userService.create({
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      name:
        name ||
        (decodedToken.email ? decodedToken.email.split('@')[0] : 'Unknown'),
      prevLoginAt: new Date(),
      avatarUrl: avatar,
      phone: phone,
      createdAt: new Date(),
      role: (role as 'sender' | 'picker') ?? 'sender',
    });

    return {
      decodedToken,
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

  public async getUserInfo(uid: string): Promise<UserDto> {
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
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      await admin.auth().revokeRefreshTokens(decodedClaims.sub);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          "You're not authorized to access this resource",
        );
      }
      this.logger.error(`Error revoking token: ${error}`);
      throw new BadRequestException('Error revoking token');
    }
  }

  async generateEmailVerificationLink(email: string): Promise<string> {
    const actionCodeSettings = {
      url: `${process.env.CLIENT_URI || 'http://localhost:3000'}/profile?emailverified=true`,
    };
    return await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    const actionCodeSettings = {
      url: process.env.CLIENT_URI || 'http://localhost:3000',
    };
    return await admin
      .auth()
      .generatePasswordResetLink(email, actionCodeSettings);
  }

  public getAvatarSize(url: string, provider: string) {
    if (provider === 'google.com') {
      return url.replace(/=s\d+-c$/, '=s150-c');
    }
    return url;
  }
}
