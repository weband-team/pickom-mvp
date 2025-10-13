import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: [
      'new_delivery',
      'offer_received',
      'status_update',
      'offer_accepted',
      'incoming_delivery',
      'new_message',
    ],
  })
  type:
    | 'new_delivery'
    | 'offer_received'
    | 'status_update'
    | 'offer_accepted'
    | 'incoming_delivery'
    | 'new_message';

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ name: 'related_delivery_id', nullable: true })
  relatedDeliveryId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
