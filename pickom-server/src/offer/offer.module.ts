import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';

@Module({
  imports: [],
  controllers: [],
  providers: [OfferService],
  exports: [OfferService],
})
export class OfferModule {}