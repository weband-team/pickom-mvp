// DTO для работы с mock данными (временно, пока используем строковые UID)
export interface DeliveryDto {
  id: number;
  senderId: string;
  pickerId: string;
  recipientId?: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
  from: string;
  to: string;
  price: number;
  createdAt: Date;
}
