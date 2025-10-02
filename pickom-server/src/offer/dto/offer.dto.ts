// DTO для работы с mock данными (временно, пока используем строковые UID)
export interface OfferDto {
  id: number;
  delivery_id: number;
  picker_id: string; // Firebase UID
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: Date;
}
