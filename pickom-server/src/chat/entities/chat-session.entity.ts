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
import { Delivery } from '../../delivery/entities/delivery.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'delivery_id', nullable: true })
  deliveryId: number | null;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'picker_id' })
  pickerId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Delivery, { nullable: true })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'picker_id' })
  picker: User;

  @OneToMany(() => Message, (message) => message.chatSession, {
    cascade: true,
  })
  messages: Message[];
}
