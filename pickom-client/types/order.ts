import { DeliveryMethodType } from './delivery';
import { PackageTypeEnum } from './package';

export enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OrderAddress {
  address: string;
  city?: string;
  country?: string;
}

export interface OrderPicker {
  id: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  phone?: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethodType;
  packageType: PackageTypeEnum;
  pickup: OrderAddress;
  dropoff: OrderAddress;
  createdAt: Date;
  pickupDateTime: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  price: number;
  currency: string;
  picker?: OrderPicker;
  notes?: string;
  packageDescription?: string;
  review?: {
    rating: number;
    comment?: string;
    createdAt: Date;
  };
}

export function canCancelOrder(order: Order): boolean {
  return order.status === OrderStatus.PENDING || order.status === OrderStatus.ACTIVE;
}

export function canReviewOrder(order: Order): boolean {
  return order.status === OrderStatus.COMPLETED && !order.review;
}

export function canContactPicker(order: Order): boolean {
  return order.status === OrderStatus.ACTIVE && !!order.picker;
}

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return '#FF9500';
    case OrderStatus.ACTIVE:
      return '#2196F3';
    case OrderStatus.COMPLETED:
      return '#4CAF50';
    case OrderStatus.CANCELLED:
      return '#9E9E9E';
    default:
      return '#9E9E9E';
  }
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending';
    case OrderStatus.ACTIVE:
      return 'Active';
    case OrderStatus.COMPLETED:
      return 'Completed';
    case OrderStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}

export function formatRoute(order: Order): string {
  const from = order.pickup.city || order.pickup.address;
  const to = order.dropoff.city || order.dropoff.address;
  return `${from} → ${to}`;
}
