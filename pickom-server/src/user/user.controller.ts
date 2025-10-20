import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { UserDto } from './dto/user.dto';

@Controller('user')
@UseGuards(FirebaseAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get(':uid/balance')
  async getUserBalance(@Param('uid') uid: string) {
    const balance = await this.userService.findUserBalance(uid);
    return { balance };
  }

  @Get(':uid')
  async getUser(@Param('uid') uid: string) {
    const user = await this.userService.findOne(uid);
    return { user };
  }

  @Put(':uid')
  async updateUser(
    @Param('uid') uid: string,
    @Body() updateData: Partial<UserDto>,
  ) {
    const user = await this.userService.update(uid, updateData);
    return { user, message: 'Profile updated successfully' };
  }

  @Delete(':uid')
  async deleteUser(@Param('uid') uid: string) {
    const user = await this.userService.delete(uid);
    return { user, message: 'Profile delete successfully' };
  }

  @Put(':uid/online-status')
  async updateOnlineStatus(
    @Param('uid') uid: string,
    @Body('isOnline') isOnline: boolean,
  ) {
    const user = await this.userService.update(uid, { isOnline });
    return { user, message: 'Online status updated successfully' };
  }

  @Put(':uid/base-price')
  async updateBasePrice(
    @Param('uid') uid: string,
    @Body('basePrice') basePrice: number,
  ) {
    const user = await this.userService.update(uid, { basePrice });
    return { user, message: 'Base price updated successfully' };
  }
}
