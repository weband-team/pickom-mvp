export class UserDto {
  id: number;
  uid: string;
  email: string;
  name: string;
  prevLoginAt?: Date;
  avatarUrl?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role: 'sender' | 'picker';
  rating?: number;
  totalRatings?: number;
  isOnline?: boolean;
  basePrice?: number;
  completedDeliveries?: number;
  totalOrders?: number;
}
