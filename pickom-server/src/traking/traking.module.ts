import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { TrakingService } from './traking.service';
import { TrakingController } from './traking.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Tracking } from './entities/traking.entity';
import { DeliveryModule } from 'src/delivery/delivery.module';
import { TrackingGateway } from './traking.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tracking]),
    UserModule,
    AuthModule,
    forwardRef(() => DeliveryModule),
  ],
  controllers: [TrakingController],
  providers: [TrakingService, TrackingGateway],
  exports: [TrakingService],
})
export class TrakingModule {}
