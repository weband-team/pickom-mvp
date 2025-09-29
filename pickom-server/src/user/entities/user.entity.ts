import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  uid: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  role: string;

  @ApiProperty()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  prevLoginAt: Date;

  @ApiProperty()
  @Column()
  updatedAt: Date;

  @ApiProperty()
  @Column()
  phone: string;

}