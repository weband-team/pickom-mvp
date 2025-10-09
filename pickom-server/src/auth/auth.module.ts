import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard],
  exports: [FirebaseAuthGuard],
})
export class AuthModule {}
