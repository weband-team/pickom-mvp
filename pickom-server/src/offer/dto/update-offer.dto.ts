import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOfferDto {
  @IsEnum(['accepted', 'rejected'])
  @IsNotEmpty()
  status: 'accepted' | 'rejected';
}
