import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard, ReqWithUser } from 'src/auth/guards/firebase-auth.guard';
import { DeliveryService } from 'src/delivery/delivery.service';
import { MOCK_TRAKINGS } from 'src/mocks/traking.mock';
import { UserService } from 'src/user/user.service';
import { TrakingService } from './traking.service';

@Controller('traking')
export class TrakingController {
  constructor(
    private readonly userService: UserService,
    private readonly trakingService: TrakingService,
  ) { }

  @Get('/:offerId')
  @UseGuards(FirebaseAuthGuard)
  async getTraking(@Param('offerId') offerId: number, @Req() req: ReqWithUser) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'sender' && user.role !== 'picker') {
      throw new ForbiddenException('User is not a sender or picker');
    }
    return await this.trakingService.getTraking(offerId);
  }

  @Put('/:offerId')
  @UseGuards(FirebaseAuthGuard)
  async updateTrakingStatus(
    @Param('offerId') offerId: number,
    @Body('status') status: 'pending' | 'in_transit' | 'completed' | 'cancelled',
    @Req() req: ReqWithUser,
  ) {
    const { uid } = req.user as { uid: string };
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== 'picker') {
      throw new ForbiddenException('Only pickers can update tracking status');
    }
    
    try {
      return await this.trakingService.updateTrakingStatus(offerId, status);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}