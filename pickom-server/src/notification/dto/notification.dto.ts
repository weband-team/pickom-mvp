// DTO для работы с mock данными (временно, пока используем строковые UID)
export interface NotificationDto {
  id: number;
  user_id: string; // Firebase UID
  title: string;
  message: string;
  type:
    | 'new_delivery'
    | 'offer_received'
    | 'status_update'
    | 'offer_accepted'
    | 'incoming_delivery'
    | 'new_message'
    | 'recipient_confirmed'
    | 'recipient_rejected';
  read: boolean;
  created_at: Date;
  related_delivery_id?: number;
}
