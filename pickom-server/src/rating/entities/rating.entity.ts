import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { User } from '../../user/entities/user.entity';

@Entity('ratings')
export class Rating {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'delivery_id' })
  deliveryId: number;

  @Column({ name: 'from_user_id' })
  fromUserId: number;

  @Column({ name: 'to_user_id' })
  toUserId: number;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Delivery, (delivery) => delivery.ratings)
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => User, (user) => user.ratingsGiven)
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.ratingsReceived)
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;
}
