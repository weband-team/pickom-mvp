import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { admin } from 'src/auth/firebase-admin.module';
import { User as UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  // Временный массив для хранения пользователей

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(uid: string): Promise<UserDto | null> {
    return (
      this.userRepository.findOne({
        where: { uid },
      }) || null
    );
  }

  async findOneByEmail(email: string): Promise<UserDto | null> {
    return (
      this.userRepository.findOne({
        where: { email },
      }) || null
    );
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find(); // Возвращаем копию массива
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
    // Генерируем uid если его нет
    const uid = userData.uid || this.generateUid();

    // Проверяем, что пользователь с таким uid не существует
    const existingUser = await this.userRepository.findOne({
      where: { uid },
    });

    if (existingUser) {
      throw new ConflictException(`User with uid ${uid} already exists`);
    }

    // Проверяем, что пользователь с таким email не существует
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

    const newUser: UserDto = {
      uid,
      email: userData.email || '',
      name: userData.name || '',
      avatarUrl: userData.avatarUrl || '',
      prevLoginAt: userData.prevLoginAt || new Date(),
      phone: userData.phone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: userData.role || 'picker',
    };

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

    // Проверяем уникальность email если он обновляется
    if (updateData.email && updateData.email !== existingUpdateUser.email) {
      const userWithSameEmail = await this.userRepository.findOne({
        where: { email: updateData.email },
      });

      if (userWithSameEmail && userWithSameEmail.uid !== uid) {
        throw new ConflictException(`Email ${updateData.email} already in use`);
      }
    }

    try {
      await admin.auth().updateUser(uid, {
        ...updateData,
      });
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('The email address is already in use');
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
      // Логируем ошибку, но не прерываем выполнение
      console.error('Error deleting user from Firebase:', error);
    }

    // Удаляем пользователя из БД
    return await this.userRepository.remove(existingDeleteUser);
  }

  // Вспомогательный метод для генерации uid
  private generateUid(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
