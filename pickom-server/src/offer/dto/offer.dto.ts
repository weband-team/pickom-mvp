// DTO for working with mock data (temporary, while using string UIDs)
export interface OfferDto {
  id: number;
  delivery_id: number;
  picker_id: string; // Firebase UID
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}
