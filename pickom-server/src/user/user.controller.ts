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
}
