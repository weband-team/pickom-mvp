import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { TrakingService } from './traking.service';
import { TrakingController } from './traking.controller';
import { OfferModule } from 'src/offer/offer.module';

@Module({
  imports: [UserModule, OfferModule],
  controllers: [TrakingController],
  providers: [TrakingService],
  exports: [TrakingService],
})
export class TrakingModule {}
