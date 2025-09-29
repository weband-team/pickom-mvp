export interface Delivery {
  id: number;
  senderId: string;
  pickerId: string;
  recipientId?: string; // ID получателя посылки
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  from: string;
  to: string;
  price: number;
  createdAt: Date;
}