import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { UserModule } from 'src/user/user.module';
import { OfferModule } from 'src/offer/offer.module';
import { TrakingModule } from 'src/traking/traking.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [UserModule, OfferModule, TrakingModule, NotificationModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
