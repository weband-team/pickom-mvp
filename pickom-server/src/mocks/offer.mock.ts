import { OfferDto } from 'src/offer/dto/offer.dto';

export const MOCK_OFFERS: OfferDto[] = [
  {
    id: 1,
    delivery_id: 1,
    picker_id: 'picker-uid-1',
    price: 50,
    message: 'Can pick up in 30 minutes and deliver within 2 hours',
    status: 'pending',
    created_at: new Date('2024-01-15T10:00:00'),
  },
  {
    id: 2,
    delivery_id: 1,
    picker_id: 'picker-uid-2',
    price: 45,
    message: 'Fast delivery within an hour!',
    status: 'pending',
    created_at: new Date('2024-01-15T10:30:00'),
  },
];
