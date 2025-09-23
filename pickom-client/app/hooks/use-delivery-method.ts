import { useState, useCallback, useEffect, useRef } from 'react';
import { DeliveryMethodType, DeliveryMethod, DELIVERY_METHODS } from '../types/delivery';

/**
 * Custom hook for managing delivery method selection with advanced features
 * Provides local state management, validation, and side effects
 */
interface UseDeliveryMethodOptions {
  initialMethod?: DeliveryMethodType | null;
  onSelect?: (method: DeliveryMethodType | null) => void;
  validateSelection?: (method: DeliveryMethodType) => boolean | Promise<boolean>;
  persistToLocalStorage?: boolean;
  localStorageKey?: string;
}

interface UseDeliveryMethodReturn {
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

export function useDeliveryMethod({
  initialMethod = null,
  onSelect,
  validateSelection,
  persistToLocalStorage = false,
  localStorageKey = 'selectedDeliveryMethod'
}: UseDeliveryMethodOptions = {}): UseDeliveryMethodReturn {
  // Load from localStorage if enabled
  const getInitialValue = () => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      const stored = localStorage.getItem(localStorageKey);
      if (stored && stored in DELIVERY_METHODS) {
        return stored as DeliveryMethodType;
      }
    }
    return initialMethod;
  };

  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethodType | null>(getInitialValue);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousMethodRef = useRef<DeliveryMethodType | null>(selectedMethod);

  // Persist to localStorage when selection changes
  useEffect(() => {
    if (persistToLocalStorage && typeof window !== 'undefined') {
      if (selectedMethod) {
        localStorage.setItem(localStorageKey, selectedMethod);
      } else {
        localStorage.removeItem(localStorageKey);
      }
    }
  }, [selectedMethod, persistToLocalStorage, localStorageKey]);

  // Call onSelect callback when method changes
  useEffect(() => {
    if (previousMethodRef.current !== selectedMethod) {
      onSelect?.(selectedMethod);
      previousMethodRef.current = selectedMethod;
    }
  }, [selectedMethod, onSelect]);

  const selectMethod = useCallback(async (method: DeliveryMethodType | null) => {
    if (!method) {
      setSelectedMethod(null);
      setError(null);
      return;
    }

    // Validate if validator is provided
    if (validateSelection) {
      setIsValidating(true);
      setError(null);

      try {
        const isValid = await validateSelection(method);
        if (isValid) {
          setSelectedMethod(method);
        } else {
          setError(`Cannot select ${DELIVERY_METHODS[method].title}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Validation failed');
      } finally {
        setIsValidating(false);
      }
    } else {
      setSelectedMethod(method);
      setError(null);
    }
  }, [validateSelection]);

  const toggleMethod = useCallback(async (method: DeliveryMethodType) => {
    if (selectedMethod === method) {
      await selectMethod(null);
    } else {
      await selectMethod(method);
    }
  }, [selectedMethod, selectMethod]);

  const clearSelection = useCallback(() => {
    setSelectedMethod(null);
    setError(null);
  }, []);

  const isSelected = useCallback((method: DeliveryMethodType) => {
    return selectedMethod === method;
  }, [selectedMethod]);

  const selectedMethodData = selectedMethod ? DELIVERY_METHODS[selectedMethod] : null;
  const canProceed = selectedMethod !== null && !isValidating && !error;

  return {
    selectedMethod,
    selectedMethodData,
    isValidating,
    error,
    selectMethod,
    toggleMethod,
    clearSelection,
    isSelected,
    canProceed
  };
}

/**
 * Hook for managing delivery method analytics
 */
export function useDeliveryMethodAnalytics(selectedMethod: DeliveryMethodType | null) {
  const startTimeRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);

  useEffect(() => {
    if (selectedMethod) {
      // Track selection event
      const selectionTime = Date.now() - startTimeRef.current;

      // In a real app, this would send to analytics service
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics: Delivery method selected', {
          method: selectedMethod,
          timeToSelect: selectionTime,
          interactions: interactionCountRef.current
        });
      }
    }
  }, [selectedMethod]);

  const trackInteraction = useCallback(() => {
    interactionCountRef.current += 1;
  }, []);

  return { trackInteraction };
}