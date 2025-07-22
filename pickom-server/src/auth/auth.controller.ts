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
import { FirebaseAuthGuard, FirebaseAuthGuardMe, ReqWithUser } from './guards/firebase-auth.guard';
import { admin } from './firebase-admin.module';
import { AuthService } from './auth.service';
import { LoginBodyDto, LoginResponseDto } from './dto/login.dto';
import { MeResponseDto, LogoutResponseDto, ErrorResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: 'Авторизует пользователя с помощью Firebase ID токена и создает сессионную куку'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer токен от Firebase Auth',
    required: true,
    example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно авторизован',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Отсутствует токен авторизации или токен недействителен',
    type: ErrorResponseDto,
  })
  public async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') authorization?: string,
    @Body() body?: LoginBodyDto,
  ) {
    try {
      console.log('🔥 Login request received');
      const accessToken = authorization?.replace('Bearer ', '');
      if (!accessToken) {
        throw new BadRequestException('Authorization token is missing');
      }

      const { userInfo } = await this.authService.verifyAndUpsertUser(accessToken, body?.role);
      const { sessionCookie, expiresIn } = await this.authService.createSessionCookie(accessToken);
      const { emailVerified } = await admin.auth().getUser(userInfo.uid);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      return {
        ...userInfo,
        emailVerified,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('You\'re not authorized to access this resource');
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuardMe)
  @ApiOperation({
    summary: 'Получение информации о текущем пользователе',
    description: 'Возвращает информацию о текущем авторизованном пользователе или null если не авторизован'
  })
  @ApiCookieAuth('session')
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе получена успешно',
    type: MeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Внутренняя ошибка сервера',
    type: ErrorResponseDto,
  })
  public async me(@Req() req: ReqWithUser) {
    try {
      if (!req.user) {
        return {
          user: null,
          message: 'Authorization is required',
        };
      }

      const { emailVerified } = await admin.auth().getUser(req.user.uid);

      return {
        user: {
          ...(await this.authService.getUserInfo(req.user.uid)),
          emailVerified,
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
    summary: 'Выход из системы',
    description: 'Отзывает сессионную куку и токены пользователя'
  })
  @ApiCookieAuth('session')
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно вышел из системы',
    type: LogoutResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Внутренняя ошибка сервера',
    type: ErrorResponseDto,
  })
  public async logout(@Req() req: ReqWithUser, @Res({ passthrough: true }) res: Response) {
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
