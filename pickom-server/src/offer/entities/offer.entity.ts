export interface Offer {
  id: number;
  delivery_id: number;
  picker_id: number;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}