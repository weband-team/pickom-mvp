import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../user/entities/user.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Offer } from '../offer/entities/offer.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Rating } from '../rating/entities/rating.entity';
import { Notification } from '../notification/entities/notification.entity';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Delivery, Offer, Payment, Rating, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // IMPORTANT: Always false for migrations
  logging: true,
});
