import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';

@Entity('delivery_tracking')
export class DeliveryTracking {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'delivery_id' })
  deliveryId: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'],
  })
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  @Column({ type: 'jsonb', nullable: true })
  location: {
    lat: number;
    lng: number;
  } | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;
}
