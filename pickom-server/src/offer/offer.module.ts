import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}
