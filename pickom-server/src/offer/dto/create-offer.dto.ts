import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  @IsNotEmpty()
  deliveryId: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  message?: string;
}
