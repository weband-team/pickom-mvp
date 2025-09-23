import { ReqWithUser } from 'src/auth/guards/firebase-auth.guard';
import { UserService } from 'src/user/user.service';
import { TrakingService } from './traking.service';
export declare class TrakingController {
    private readonly userService;
    private readonly trakingService;
    constructor(userService: UserService, trakingService: TrakingService);
    getTraking(offerId: number, req: ReqWithUser): Promise<import("./entities/traking.entity").Traking | null>;
    updateTrakingStatus(offerId: number, status: 'pending' | 'in_transit' | 'completed' | 'cancelled', req: ReqWithUser): Promise<import("./entities/traking.entity").Traking>;
}
