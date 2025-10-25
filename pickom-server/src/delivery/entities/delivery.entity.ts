import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Offer } from '../../offer/entities/offer.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Rating } from '../../rating/entities/rating.entity';
import { DeliveryTracking } from '../../tracking/entities/tracking.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'picker_id', nullable: true })
  pickerId: number | null;

  @Column({ name: 'recipient_id', nullable: true })
  recipientId: number | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', name: 'from_location', nullable: true })
  fromLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  @Column({ type: 'jsonb', name: 'to_location', nullable: true })
  toLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;

  @Column({
    type: 'enum',
    enum: ['within-city', 'inter-city'],
    default: 'within-city',
    name: 'delivery_type',
  })
  deliveryType: 'within-city' | 'inter-city';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ['small', 'medium', 'large'] })
  size: 'small' | 'medium' | 'large';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  @Column({ type: 'date', nullable: true, name: 'delivery_date' })
  deliveryDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true, name: 'deliveries_url' })
  deliveriesUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.sentDeliveries)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.pickedDeliveries)
  @JoinColumn({ name: 'picker_id' })
  picker: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @OneToMany(() => Offer, (offer) => offer.delivery)
  offers: Offer[];

  @OneToMany(() => Payment, (payment) => payment.delivery)
  payments: Payment[];

  @OneToMany(() => Rating, (rating) => rating.delivery)
  ratings: Rating[];

  @OneToMany(() => DeliveryTracking, (tracking) => tracking.delivery)
  tracking: DeliveryTracking[];
}
