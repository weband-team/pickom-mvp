import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { User } from '../../user/entities/user.entity';

@Entity('tracking')
export class Tracking {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'delivery_id' })
  deliveryId: number;

  @Column({ name: 'picker_id' })
  pickerId: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'receiver_id', nullable: true })
  receiverId: number | null;

  // Pickup location (from_location)
  @Column({ type: 'jsonb', name: 'from_location' })
  fromLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  };

  // Delivery destination (to_location)
  @Column({ type: 'jsonb', name: 'to_location' })
  toLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  };

  // Current picker location (real-time updates)
  @Column({ type: 'jsonb', name: 'picker_location', nullable: true })
  pickerLocation: {
    lat: number;
    lng: number;
    timestamp: string;
  } | null;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'picked_up', 'delivered', 'cancelled'],
    default: 'accepted',
  })
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'picker_id' })
  picker: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}

// Keep old interface for backward compatibility
export interface Traking {
  id: number;
  deliveryId: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
}
