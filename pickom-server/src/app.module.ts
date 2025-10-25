import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { DeliveryModule } from './delivery/delivery.module';
import { OfferModule } from './offer/offer.module';
import { TrackingModule } from './tracking/tracking.module';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { RatingModule } from './rating/rating.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    DeliveryModule,
    OfferModule,
    TrackingModule,
    NotificationModule,
    ChatModule,
    RatingModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
