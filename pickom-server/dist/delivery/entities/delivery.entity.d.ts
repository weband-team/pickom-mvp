export interface Delivery {
    id: number;
    senderId: string;
    pickerId: string;
    status: 'pending' | 'accepted' | 'declined';
    from: string;
    to: string;
    price: number;
    createdAt: Date;
}
