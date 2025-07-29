import { Delivery } from "src/delivery/entities/delivery.entity";
import { Offer } from "src/offer/entities/offer.entity";
import { Traking } from "src/traking/entities/traking.entity";

export const MOCK_TRAKINGS: Traking[] = [
  {
    id: 1,
    offerId: 1,
    status: 'in_transit',
    createdAt: new Date(),
  },
];