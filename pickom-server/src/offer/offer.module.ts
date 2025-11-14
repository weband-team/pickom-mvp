import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { Offer } from './entities/offer.entity';
import { Payment } from '../payment/entities/payment.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { TrakingModule } from 'src/traking/traking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Payment]),
    NotificationModule,
    UserModule,
    forwardRef(() => DeliveryModule),
    forwardRef(() => TrakingModule),
  ],
  controllers: [OfferController],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
