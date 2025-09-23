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