export interface DeliveryDto {
  id: number;
  senderId: string | null;
  pickerId: string | null;
  recipientId?: string | null;
  recipientPhone?: string | null;
  recipientConfirmed?: boolean;
  title: string;
  description?: string | null;
  fromLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;
  toLocation: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    placeId?: string;
  } | null;
  deliveryType?: 'within-city' | 'inter-city' | 'international';
  price: number;
  size: 'small' | 'medium' | 'large';
  weight?: number | null;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  notes?: string | null;
  deliveriesUrl?: string | null;
  packageImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
