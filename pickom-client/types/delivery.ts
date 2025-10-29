export type DeliveryMethodType = 'within-city' | 'inter-city' | 'international';

export interface DeliveryMethod {
  id: DeliveryMethodType;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  isAvailable: boolean;
}

export interface DeliveryMethodConfig {
  methods: DeliveryMethod[];
  defaultSelected?: DeliveryMethodType | null;
}

export const DELIVERY_METHODS: Record<DeliveryMethodType, DeliveryMethod> = {
  'within-city': {
    id: 'within-city',
    title: 'Within-City',
    subtitle: 'Same city delivery',
    icon: '🏠',
    description: 'Fast delivery within city limits',
    isAvailable: true
  },
  'inter-city': {
    id: 'inter-city',
    title: 'Inter-City',
    subtitle: 'Between cities',
    icon: '🚗',
    description: 'Delivery between cities in the same country',
    isAvailable: true
  },
  'international': {
    id: 'international',
    title: 'International',
    subtitle: 'Cross-border delivery',
    icon: '✈️',
    description: 'International delivery across borders',
    isAvailable: true
  }
} as const;

export const DEFAULT_DELIVERY_CONFIG: DeliveryMethodConfig = {
  methods: Object.values(DELIVERY_METHODS),
  defaultSelected: null
};

// DeliveryRequest types for picker/sender marketplace (MVP - excluding international)
export type DeliveryRequestType = 'within-city' | 'inter-city';

export type DeliveryStatus = 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export interface DeliveryRequest {
  // id: number;
  // senderId: string;
  // senderName?: string;
  // senderRating?: number;
  // fromLocation: Location | null;
  // toLocation: Location | null;
  // price: number;
  // deliveryType?: DeliveryRequestType; // Optional - can be undefined if not set yet
  // packageType?: string; // References PackageTypeEnum from package.ts
  // packageDescription?: string;
  // status: DeliveryStatus;
  // createdAt: string;
  id: number;
    senderId: string;
    pickerId?: string;
    recipientId?: string;
    recipientPhone?: string;
    recipientConfirmed?: boolean;
    title: string;
    description?: string;
    fromLocation: Location | null;
    toLocation: Location | null;
    deliveryType?: 'within-city' | 'inter-city' | 'international';
    price: number;
    size: 'small' | 'medium' | 'large';
    weight?: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    senderName?: string;
    senderRating?: number;
}

