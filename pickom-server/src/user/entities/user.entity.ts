import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Rating } from '../../rating/entities/rating.entity';
import { Notification } from '../../notification/entities/notification.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty()
  @Column({ unique: true, name: 'firebase_uid' })
  uid: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: ['sender', 'picker'] })
  role: 'sender' | 'picker';

  @ApiProperty()
  @Column({ nullable: true, name: 'avatar_url', type: 'text' })
  avatarUrl: string;

  @ApiProperty()
  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
    nullable: true,
  })
  rating: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0, name: 'total_ratings' })
  totalRatings: number;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true, name: 'prev_login_at' })
  prevLoginAt: Date;

  // Relations
  @OneToMany(() => Delivery, (delivery) => delivery.sender)
  sentDeliveries: Delivery[];

  @OneToMany(() => Delivery, (delivery) => delivery.picker)
  pickedDeliveries: Delivery[];

  @OneToMany(() => Offer, (offer) => offer.picker)
  offers: Offer[];

  @OneToMany(() => Payment, (payment) => payment.fromUser)
  paymentsSent: Payment[];

  @OneToMany(() => Payment, (payment) => payment.toUser)
  paymentsReceived: Payment[];

  @OneToMany(() => Rating, (rating) => rating.fromUser)
  ratingsGiven: Rating[];

  @OneToMany(() => Rating, (rating) => rating.toUser)
  ratingsReceived: Rating[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
