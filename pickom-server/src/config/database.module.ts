import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Offer } from 'src/offer/entities/offer.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        // ssl: {
        //   rejectUnauthorized: false,
        // }, Только на прод
        entities: [User, Delivery, Offer, Payment, Rating, Notification],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
