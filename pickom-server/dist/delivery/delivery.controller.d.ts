import { DeliveryService } from './delivery.service';
import { ReqWithUser } from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { OfferService } from 'src/offer/offer.service';
import { TrakingService } from 'src/traking/traking.service';
export declare class DeliveryController {
    private readonly deliveryService;
    private readonly userService;
    private readonly offerService;
    private readonly trakingService;
    constructor(deliveryService: DeliveryService, userService: UserService, offerService: OfferService, trakingService: TrakingService);
    getAvailablePickers(): Promise<{
        price: number;
        uid: string;
        email: string;
        name: string;
        avatarUrl?: string;
        role: string;
        prevLoginAt: Date;
        createdAt: Date;
        updatedAt: Date;
        phone?: string;
    }[]>;
    createDeliveryRequest(req: ReqWithUser, pickerId: string, from: string, to: string, price: number): Promise<import("./entities/delivery.entity").Delivery>;
    getAllDeliveryRequests(req: ReqWithUser): Promise<import("./entities/delivery.entity").Delivery[]>;
    getDeliveryRequestById(id: number, req: ReqWithUser): Promise<import("./entities/delivery.entity").Delivery | null>;
    updateDeliveryRequestStatus(id: number, status: 'accepted' | 'declined', req: ReqWithUser): Promise<void>;
}
