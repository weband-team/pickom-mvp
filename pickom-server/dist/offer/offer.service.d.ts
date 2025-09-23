import { Offer } from './entities/offer.entity';
export declare class OfferService {
    private offers;
    constructor();
    createOffer(deliveryId: number): Promise<Offer>;
    updateOfferStatus(offerId: number, status: 'pending' | 'in_transit' | 'completed' | 'cancelled'): Promise<Offer | null>;
    getOfferById(offerId: number): Promise<Offer | null>;
}
