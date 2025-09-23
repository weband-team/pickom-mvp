import { Traking } from './entities/traking.entity';
import { OfferService } from 'src/offer/offer.service';
export declare class TrakingService {
    private readonly offerService;
    private traking;
    constructor(offerService: OfferService);
    getTraking(id: number): Promise<Traking | null>;
    updateTrakingStatus(offerId: number, status: 'pending' | 'in_transit' | 'completed' | 'cancelled'): Promise<Traking>;
}
