import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
  Body,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiHeader,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FirebaseAuthGuard, ReqWithUser } from './guards/firebase-auth.guard';
import { admin } from './firebase-admin.module';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginResponseDto } from './dto/login.dto';
import {
  MeResponseDto,
  LogoutResponseDto,
  ErrorResponseDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login existing user',
    description:
      'Authenticates existing user using Firebase ID token and creates session cookie',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token from Firebase Auth',
    required: true,
    example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User not found or token invalid',
    type: ErrorResponseDto,
  })
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authorization?: string,
  ) {
    try {
      console.log('🔥 Login request received');
      const accessToken = authorization?.replace('Bearer ', '');
      if (!accessToken) {
        throw new BadRequestException('Authorization token is missing');
      }

      const { userInfo } =
        await this.authService.verifyAndLoginUser(accessToken);
      const { sessionCookie, expiresIn } =
        await this.authService.createSessionCookie(accessToken);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return {
        ...userInfo,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error.message || "You're not authorized to access this resource",
      );
    }
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Creates new user in DB using Firebase ID token and creates session cookie',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token from Firebase Auth',
    required: true,
    example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully registered',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'User already exists or token invalid',
    type: ErrorResponseDto,
  })
  public async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authorization?: string,
    @Body() body?: LoginBodyDto,
  ) {
    try {
      console.log('🔥 Register request received');
      const accessToken = authorization?.replace('Bearer ', '');
      if (!accessToken) {
        throw new BadRequestException('Authorization token is missing');
      }

      if (!body?.role) {
        throw new BadRequestException('User role is required');
      }

      const { userInfo } = await this.authService.verifyAndCreateUser(
        accessToken,
        body.role,
        body.name,
        body.phone,
      );
      const { sessionCookie, expiresIn } =
        await this.authService.createSessionCookie(accessToken);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return {
        ...userInfo,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Get current user information',
    description:
      'Returns information about currently authenticated user or null if not authenticated',
  })
  @ApiCookieAuth('session')
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: MeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  public async me(@Req() req: ReqWithUser) {
    try {
      // if (!req.user) {
      //   return {
      //     user: null,
      //     message: 'Authorization is required',
      //   };
      // }

      return {
        user: {
          ...(await this.authService.getUserInfo(req.user.uid)),
        },
        message: 'User data retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error at /me: ${error}`);
      throw new BadRequestException('Internal server error');
    }
  }

  @Post('logout')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Logout',
    description: 'Revokes session cookie and user tokens',
  })
  @ApiCookieAuth('session')
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  public async logout(
    @Req() req: ReqWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      await this.authService.revokeToken(req.cookies.session);
      res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Error at /logout: ${error}`);
      throw new BadRequestException('Internal server error');
    }
  }
}
