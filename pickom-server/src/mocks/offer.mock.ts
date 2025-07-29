import { Delivery } from "src/delivery/entities/delivery.entity";
import { Offer } from "src/offer/entities/offer.entity";

export const MOCK_OFFERS: Offer[] = [
  {
    id: 1,
    deliveryId: 1,
    createdAt: new Date(),
    status: 'in_transit',
  },
];