export interface Notification {
  id: number;
  user_id: string; // Firebase UID
  title: string;
  message: string;
  type: 'offer_received' | 'offer_accepted' | 'status_update' | 'incoming_delivery';
  read: boolean;
  created_at: Date;
  related_delivery_id?: number;
}