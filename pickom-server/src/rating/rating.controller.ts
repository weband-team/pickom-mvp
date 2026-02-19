import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingDto } from './dto/rating.dto';
import {
  FirebaseAuthGuard,
  ReqWithUser,
} from '../auth/guards/firebase-auth.guard';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({
    status: 201,
    description: 'Rating created successfully',
    type: RatingDto,
  })
  async createRating(
    @Req() req: ReqWithUser,
    @Body() createDto: CreateRatingDto,
  ): Promise<RatingDto> {
    const { uid } = req.user as { uid: string };
    return await this.ratingService.createRating(uid, createDto);
  }

  @Get('delivery/:id')
  @ApiOperation({ summary: 'Get all ratings for a delivery' })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
    type: [RatingDto],
  })
  async getRatingsByDelivery(@Param('id') id: number): Promise<RatingDto[]> {
    return await this.ratingService.getRatingsByDelivery(id);
  }

  @Get('user/:uid')
  @ApiOperation({ summary: 'Get all ratings for a user' })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
    type: [RatingDto],
  })
  async getRatingsByUser(@Param('uid') uid: string): Promise<RatingDto[]> {
    return await this.ratingService.getRatingsByUser(uid);
  }
}
