import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { RatingDto } from './dto/rating.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UserService } from '../user/user.service';
import { User as UserEntity } from '../user/entities/user.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  async createRating(
    fromUserUid: string,
    createDto: CreateRatingDto,
  ): Promise<RatingDto> {
    const fromUser = (await this.userService.findOne(
      fromUserUid,
    )) as UserEntity;
    if (!fromUser) {
      throw new NotFoundException('From user not found');
    }

    const toUser = (await this.userService.findOne(
      createDto.toUserId,
    )) as UserEntity;
    if (!toUser) {
      throw new NotFoundException('To user not found');
    }

    const existingRating = await this.ratingRepository.findOne({
      where: {
        deliveryId: createDto.deliveryId,
        fromUserId: fromUser.id,
        toUserId: toUser.id,
      },
    });

    if (existingRating) {
      throw new BadRequestException(
        'You have already rated this user for this delivery',
      );
    }

    const rating = new Rating();
    rating.deliveryId = createDto.deliveryId;
    rating.fromUserId = fromUser.id;
    rating.toUserId = toUser.id;
    rating.rating = createDto.rating;
    rating.comment = createDto.comment ?? null;

    const savedRating = await this.ratingRepository.save(rating);

    await this.updateUserRating(toUser.id);

    return this.entityToDto(savedRating, fromUserUid, createDto.toUserId);
  }

  async getRatingsByDelivery(deliveryId: number): Promise<RatingDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { deliveryId },
      relations: ['fromUser', 'toUser'],
    });

    return ratings.map((rating) =>
      this.entityToDto(rating, rating.fromUser.uid, rating.toUser.uid),
    );
  }

  async getRatingsByUser(userUid: string): Promise<RatingDto[]> {
    const user = (await this.userService.findOne(userUid)) as UserEntity;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ratings = await this.ratingRepository.find({
      where: { toUserId: user.id },
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });

    return ratings.map((rating) =>
      this.entityToDto(rating, rating.fromUser.uid, rating.toUser.uid),
    );
  }

  private async updateUserRating(userId: number): Promise<void> {
    const ratings = await this.ratingRepository.find({
      where: { toUserId: userId },
    });

    if (ratings.length === 0) {
      return;
    }

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    await this.userRepository.update(userId, {
      rating: parseFloat(averageRating.toFixed(2)),
      totalRatings: ratings.length,
    });
  }

  private entityToDto(
    rating: Rating,
    fromUserUid: string,
    toUserUid: string,
  ): RatingDto {
    return {
      id: rating.id,
      deliveryId: rating.deliveryId,
      fromUserId: fromUserUid,
      toUserId: toUserUid,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
    };
  }
}
