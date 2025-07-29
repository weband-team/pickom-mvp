import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { DeliveryModule } from './delivery/delivery.module';
import { OfferModule } from './offer/offer.module';
import { TrakingModule } from './traking/traking.module';

@Module({
  imports: [AuthModule, DeliveryModule, OfferModule, TrakingModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
