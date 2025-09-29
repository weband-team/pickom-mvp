import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { DeliveryModule } from './delivery/delivery.module';
import { OfferModule } from './offer/offer.module';
import { TrakingModule } from './traking/traking.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [AuthModule, DeliveryModule, OfferModule, TrakingModule, DatabaseModule, UserModule, NotificationModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
