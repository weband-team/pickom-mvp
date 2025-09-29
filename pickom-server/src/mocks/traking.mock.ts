import { Delivery } from "src/delivery/entities/delivery.entity";
import { Offer } from "src/offer/entities/offer.entity";
import { Traking } from "src/traking/entities/traking.entity";

export const MOCK_TRAKINGS: Traking[] = [
  {
    id: 1,
    deliveryId: 1,
    status: 'picked_up',
    createdAt: new Date(),
  },
];