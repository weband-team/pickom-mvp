import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { UserModule } from 'src/user/user.module';
import { OfferModule } from 'src/offer/offer.module';
import { TrakingModule } from 'src/traking/traking.module';

@Module({
  imports: [UserModule, OfferModule, TrakingModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}