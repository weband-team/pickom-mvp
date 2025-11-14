import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { Delivery } from './entities/delivery.entity';
import { UserModule } from 'src/user/user.module';
import { OfferModule } from 'src/offer/offer.module';
import { TrakingModule } from 'src/traking/traking.module';
import { NotificationModule } from 'src/notification/notification.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery]),
    UserModule,
    forwardRef(() => OfferModule),
    forwardRef(() => TrakingModule),
    NotificationModule,
    AuthModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
