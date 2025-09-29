export interface Traking {
  id: number;
  deliveryId: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: Date;
}
