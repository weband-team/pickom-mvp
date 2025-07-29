import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { admin } from 'src/auth/firebase-admin.module';
import { User } from './types/user.type';

@Injectable()
export class UserService {
  // Временный массив для хранения пользователей
  private users: User[] = [];

  constructor() { }

  async findOne(uid: string): Promise<User | undefined> {
    return this.users.find(user => user.uid === uid);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users]; // Возвращаем копию массива
  }

  async findAllPickers(): Promise<User[]> {
    return this.users.filter((user) => user.role === 'picker');
  }

  async create(userData: Partial<User>): Promise<User> {
    // Генерируем uid если его нет
    const uid = userData.uid || this.generateUid();

    // Проверяем, что пользователь с таким uid не существует
    const existingUser = this.users.find(user => user.uid === uid);
    if (existingUser) {
      throw new ConflictException(`User with uid ${uid} already exists`);
    }

    // Проверяем, что пользователь с таким email не существует
    if (userData.email) {
      const existingUserByEmail = this.users.find(user => user.email === userData.email);
      if (existingUserByEmail) {
        throw new ConflictException(`User with email ${userData.email} already exists`);
      }
    }

    const newUser: User = {
      uid,
      email: userData.email || '',
      name: userData.name || '',
      avatarUrl: userData.avatarUrl || '',
      prevLoginAt: userData.prevLoginAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: userData.role || 'picker'
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(uid: string, updateData: Partial<User>): Promise<User> {
    const existingUserIndex = this.users.findIndex(user => user.uid === uid);
    if (existingUserIndex === -1) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    const existingUser = this.users[existingUserIndex];

    // Проверяем уникальность email если он обновляется
    if (updateData.email && updateData.email !== existingUser.email) {
      const userWithSameEmail = this.users.find(user => user.email === updateData.email && user.uid !== uid);
      if (userWithSameEmail) {
        throw new ConflictException('The email address is already in use');
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

    // Обновляем данные пользователя
    const updatedUser = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date()
    };

    this.users[existingUserIndex] = updatedUser;
    return updatedUser;
  }

  async delete(uid: string): Promise<User> {
    const existingUserIndex = this.users.findIndex(user => user.uid === uid);
    if (existingUserIndex === -1) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }

    const existingUser = this.users[existingUserIndex];

    try {
      await admin.auth().deleteUser(uid);
      await admin.app().database().ref(`profiles/${uid}`).remove();
    } catch (error) {
      // Логируем ошибку, но не прерываем выполнение
      console.error('Error deleting user from Firebase:', error);
    }

    // Удаляем пользователя из массива
    this.users.splice(existingUserIndex, 1);
    return existingUser;
  }

  // Вспомогательный метод для генерации uid
  private generateUid(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
