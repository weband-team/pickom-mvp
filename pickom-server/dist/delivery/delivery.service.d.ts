import { Delivery } from './entities/delivery.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/types/user.type';
export declare class DeliveryService {
    private readonly userService;
    private deliveryRequests;
    private users;
    constructor(userService: UserService);
    getAvailablePickers(): Promise<User[]>;
    createDeliveryRequest(senderId: string, pickerId: string, from: string, to: string, price: number): Promise<Delivery>;
    getAllDeliveryRequests(uid: string, role: string): Promise<Delivery[]>;
    getDeliveryRequestById(id: number, uid: string, role: string): Promise<Delivery | null>;
    updateDeliveryRequestStatus(id: number, status: 'accepted' | 'declined', uid: string): Promise<Delivery | null>;
}
