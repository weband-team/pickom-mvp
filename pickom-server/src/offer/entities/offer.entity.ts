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

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'delivery_id' })
  deliveryId: number;

  @Column({ name: 'picker_id' })
  pickerId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Delivery, (delivery) => delivery.offers)
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => User, (user) => user.offers)
  @JoinColumn({ name: 'picker_id' })
  picker: User;
}
