import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { User } from '../../user/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'delivery_id', nullable: true })
  deliveryId: number | null;

  @Column({ name: 'from_user_id' })
  fromUserId: number;

  @Column({ name: 'to_user_id', nullable: true })
  toUserId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({
    type: 'varchar',
    name: 'stripe_payment_intent_id',
    nullable: true,
    unique: true,
  })
  stripePaymentIntentId: string | null;

  @Column({ type: 'varchar', name: 'stripe_client_secret', nullable: true })
  stripeClientSecret: string | null;

  @Column({ length: 3, default: 'usd' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Delivery, (delivery) => delivery.payments, {
    nullable: true,
  })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery | null;

  @ManyToOne(() => User, (user) => user.paymentsSent)
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.paymentsReceived, { nullable: true })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User | null;
}
