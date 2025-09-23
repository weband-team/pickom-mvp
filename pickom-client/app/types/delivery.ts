export type DeliveryMethodType = 'intra-city' | 'inter-city' | 'international';

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
  'intra-city': {
    id: 'intra-city',
    title: 'Intra-city',
    subtitle: 'Within the same city',
    icon: '🏠',
    description: 'Fast delivery within city limits',
    isAvailable: true
  },
  'inter-city': {
    id: 'inter-city',
    title: 'Inter-city',
    subtitle: 'Between different cities',
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