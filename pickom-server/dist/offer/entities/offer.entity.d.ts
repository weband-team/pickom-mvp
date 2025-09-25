export interface Offer {
    id: number;
    deliveryId: number;
    createdAt: Date;
    status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
}
