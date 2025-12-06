import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { admin } from 'src/auth/firebase-admin.module';
import { User as UserEntity } from './entities/user.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  // Temporary array for storing users

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
  ) {}

  async findUserBalance(uid: string): Promise<number | null> {
    const user = await this.userRepository.findOne({
      where: { uid },
      select: ['balance'],
    });
    return user ? Number(user.balance) : null;
  }

  async addToBalance(uid: string, amount: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid },
    });
    if (!user) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }
    const currentBalance = Number(user.balance) || 0;
    user.balance = currentBalance + amount;
    await this.userRepository.save(user);
  }

  async subtractFromBalance(uid: string, amount: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uid },
    });
    if (!user) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }
    const currentBalance = Number(user.balance) || 0;
    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`,
      );
    }
    user.balance = currentBalance - amount;
    await this.userRepository.save(user);
  }

  // Alias for clarity
  async deductBalance(uid: string, amount: number): Promise<void> {
    return this.subtractFromBalance(uid, amount);
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return user;
  }

  async findOne(uid: string): Promise<UserDto | null> {
    const user = await this.userRepository.findOne({
      where: { uid },
    });

    if (!user) {
      return null;
    }

    // Calculate delivery statistics
    const stats = await this.calculateUserStats(user);

    // Return user with stats
    return {
      ...user,
      completedDeliveries: stats.completedDeliveries,
      totalOrders: stats.totalOrders,
    };
  }

  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return (
      this.userRepository.findOne({
        where: { email },
      }) || null
    );
  }

  async findByEmailOrUid(emailOrUid: string): Promise<UserEntity | null> {
    // Check if it's an email (contains @)
    if (emailOrUid.includes('@')) {
      return await this.userRepository.findOne({
        where: { email: emailOrUid },
      });
    }

    // Otherwise treat as UID
    return await this.userRepository.findOne({
      where: { uid: emailOrUid },
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find(); // Return copy of array
  }

  async findAllPickers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { role: 'picker' },
    });
  }

  async findAllActivePickers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { role: 'picker', active: true },
    });
  }

  async create(userData: Partial<UserDto>): Promise<UserDto> {
    // Generate uid if not provided
    const uid = userData.uid || this.generateUid();

    // Check that user with this uid doesn't exist
    const existingUser = await this.userRepository.findOne({
      where: { uid },
    });

    if (existingUser) {
      throw new ConflictException(`User with uid ${uid} already exists`);
    }

    // Check that user with this email doesn't exist
    if (userData.email) {
      const email = userData.email;
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUserByEmail) {
        throw new ConflictException(
          `User with email ${userData.email} already exists`,
        );
      }
    }

    const newUser = this.userRepository.create({
      uid,
      email: userData.email || '',
      name: userData.name || '',
      avatarUrl: userData.avatarUrl || '',
      prevLoginAt: userData.prevLoginAt || new Date(),
      phone: userData.phone || '',
      role: userData.role || 'picker',
    });

    return this.userRepository.save(newUser);
  }

  async update(
    uid: string,
    updateData: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const existingUpdateUser = await this.userRepository.findOne({
      where: { uid },
    });
    if (!existingUpdateUser) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    // Prohibit email changes through regular profile update
    // Email changes only through Firebase Authentication
    if (updateData.email && updateData.email !== existingUpdateUser.email) {
      throw new ConflictException(
        'Email cannot be changed through profile update. Please use account settings.',
      );
    }

    // Update only allowed fields in Firebase (without email)
    const firebaseUpdateData: any = {};
    if (updateData.name) firebaseUpdateData.displayName = updateData.name;
    if (updateData.avatarUrl)
      firebaseUpdateData.photoURL = updateData.avatarUrl;

    // Add phone only if in E.164 format (starts with +)
    if (updateData.phone) {
      const phoneStr = String(updateData.phone).trim();
      if (phoneStr.startsWith('+') && phoneStr.length >= 10) {
        firebaseUpdateData.phoneNumber = phoneStr;
      } else {
        console.warn(
          'Phone number not in E.164 format, skipping Firebase update:',
          phoneStr,
        );
      }
    }

    // Update only if there's something to update
    if (Object.keys(firebaseUpdateData).length > 0) {
      try {
        await admin.auth().updateUser(uid, firebaseUpdateData);
      } catch (error) {
        console.error('Error updating Firebase user:', error);
        // Don't throw error, as data is still saved in DB
      }
    }

    await this.userRepository.update(
      { uid },
      {
        ...updateData,
        updatedAt: new Date(),
      },
    );

    const updatedUser = await this.userRepository.findOne({ where: { uid } });
    if (!updatedUser) {
      throw new NotFoundException(
        `User with uid ${uid} not found after update`,
      );
    }
    return updatedUser;
  }

  async delete(uid: string): Promise<UserEntity> {
    const existingDeleteUser = await this.userRepository.findOne({
      where: { uid },
    });
    if (!existingDeleteUser) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      // Log error but don't interrupt execution
      console.error('Error deleting user from Firebase:', error);
    }

    // Delete user from DB
    return await this.userRepository.remove(existingDeleteUser);
  }

  // Calculate user delivery statistics
  private async calculateUserStats(user: UserEntity): Promise<{
    completedDeliveries: number;
    totalOrders: number;
  }> {
    // Count completed deliveries for pickers (status = 'delivered')
    const completedDeliveries = await this.deliveryRepository.count({
      where: {
        pickerId: user.id,
        status: 'delivered',
      },
    });

    // Count total orders created by senders
    const totalOrders = await this.deliveryRepository.count({
      where: {
        senderId: user.id,
      },
    });

    return {
      completedDeliveries,
      totalOrders,
    };
  }

  // Helper method to generate uid
  private generateUid(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
