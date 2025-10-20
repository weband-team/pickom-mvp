export interface DeliveryDto {
  id: number;
  senderId: string | null;
  pickerId: string | null;
  recipientId?: string | null;
  recipientPhone?: string | null;
  recipientConfirmed?: boolean;
  title: string;
  description?: string | null;
  fromAddress: string;
  fromCity?: string | null;
  toAddress: string;
  toCity?: string | null;
  deliveryType?: 'within-city' | 'inter-city';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number | null;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  notes?: string | null;
  deliveriesUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
