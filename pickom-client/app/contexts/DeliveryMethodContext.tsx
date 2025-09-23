'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DeliveryMethodType, DeliveryMethod } from '../types/delivery';
import { useDeliveryMethod } from '../hooks/use-delivery-method';

/**
 * Context shape for delivery method management
 */
interface DeliveryMethodContextType {
  selectedMethod: DeliveryMethodType | null;
  selectedMethodData: DeliveryMethod | null;
  isValidating: boolean;
  error: string | null;
  selectMethod: (method: DeliveryMethodType | null) => Promise<void>;
  toggleMethod: (method: DeliveryMethodType) => Promise<void>;
  clearSelection: () => void;
  isSelected: (method: DeliveryMethodType) => boolean;
  canProceed: boolean;
}

const DeliveryMethodContext = createContext<DeliveryMethodContextType | null>(null);

/**
 * Provider component for delivery method context
 */
interface DeliveryMethodProviderProps {
  children: ReactNode;
  initialMethod?: DeliveryMethodType | null;
  onSelect?: (method: DeliveryMethodType | null) => void;
  validateSelection?: (method: DeliveryMethodType) => boolean | Promise<boolean>;
  persistToLocalStorage?: boolean;
}

export function DeliveryMethodProvider({
  children,
  ...options
}: DeliveryMethodProviderProps) {
  const deliveryMethodState = useDeliveryMethod(options);

  return (
    <DeliveryMethodContext.Provider value={deliveryMethodState}>
      {children}
    </DeliveryMethodContext.Provider>
  );
}

/**
 * Hook to access delivery method context
 * Throws error if used outside of provider
 */
export function useDeliveryMethodContext() {
  const context = useContext(DeliveryMethodContext);

  if (!context) {
    throw new Error(
      'useDeliveryMethodContext must be used within a DeliveryMethodProvider'
    );
  }

  return context;
}

/**
 * HOC to inject delivery method props
 */
export function withDeliveryMethod<P extends object>(
  Component: React.ComponentType<P & DeliveryMethodContextType>
) {
  return function WithDeliveryMethodComponent(props: P) {
    const deliveryMethodProps = useDeliveryMethodContext();

    return <Component {...props} {...deliveryMethodProps} />;
  };
}