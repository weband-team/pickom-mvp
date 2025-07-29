export interface Traking {
  id: number;
  offerId: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  createdAt: Date;
}