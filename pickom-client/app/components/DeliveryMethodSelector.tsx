'use client';

import React, { useCallback, useMemo, useId, useEffect, useState } from 'react';
import { DeliveryMethodType, DeliveryMethodConfig, DEFAULT_DELIVERY_CONFIG } from '../types/delivery';
import { cn } from '../utils/cn';

interface DeliveryMethodSelectorProps {
  config?: DeliveryMethodConfig;
  value?: DeliveryMethodType | null;
  defaultValue?: DeliveryMethodType | null;
  onChange?: (method: DeliveryMethodType | null) => void;
  disabled?: boolean;
  className?: string;
  showStatus?: boolean;
  allowDeselect?: boolean;
}

/**
 * Delivery Method Selector Component
 * Supports both controlled and uncontrolled modes with proper React patterns
 */
export default function DeliveryMethodSelector({
  config = DEFAULT_DELIVERY_CONFIG,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className = '',
  showStatus = true,
  allowDeselect = true
}: DeliveryMethodSelectorProps) {
  const selectorId = useId();

  // Determine if component is controlled
  const isControlled = value !== undefined;

  // Use proper controlled/uncontrolled pattern
  const [internalValue, setInternalValue] = useState<DeliveryMethodType | null>(
    defaultValue ?? null
  );

  const currentValue = isControlled ? value : internalValue;

  // Warn about improper usage in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (value !== undefined && defaultValue !== undefined) {
        console.warn(
          'DeliveryMethodSelector: You provided both value and defaultValue props. ' +
          'The component will operate in controlled mode and defaultValue will be ignored.'
        );
      }
    }
  }, [value, defaultValue]);

  const handleMethodSelect = useCallback((methodId: string) => {
    if (disabled) return;

    const typedMethodId = methodId as DeliveryMethodType;
    // Allow deselection by clicking the same method again
    const newValue = (allowDeselect && currentValue === typedMethodId) ? null : typedMethodId;

    // Update internal state for uncontrolled mode
    if (!isControlled) {
      setInternalValue(newValue);
    }

    // Call onChange handler if provided
    onChange?.(newValue);
  }, [currentValue, disabled, onChange, allowDeselect, isControlled]);

  // Memoize computed values
  const availableMethods = useMemo(() =>
    config.methods.filter(method => method.isAvailable),
    [config.methods]
  );

  const selectedMethod = useMemo(() =>
    currentValue ? config.methods.find(m => m.id === currentValue) : null,
    [currentValue, config.methods]
  );

  const hasSelection = currentValue !== null;

  return (
    <div
      className={cn('delivery-method-selector', className)}
      role="radiogroup"
      aria-labelledby={`${selectorId}-label`}
      aria-required="true"
      data-testid="delivery-method-selector"
    >
      <h2 id={`${selectorId}-label`} className="sr-only">
        Select delivery method
      </h2>

      {/* Segmented Control */}
      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-lg gap-2">
          {config.methods.map((method, index) => {
            const isSelected = currentValue === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handleMethodSelect(method.id)}
                disabled={disabled || !method.isAvailable}
                className={cn(
                  'flex-1 px-4 py-3 text-base font-medium transition-all duration-200',
                  'border-2 border-gray-800 bg-transparent text-white rounded-xl',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                  'hover:bg-gray-800/20',
                  {
                    'border-orange-500 bg-orange-500/20 text-orange-100': isSelected,
                    'opacity-50 cursor-not-allowed': disabled || !method.isAvailable
                  }
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${method.title} delivery method`}
              >
                {method.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection Status - only show when method is selected */}
      {showStatus && hasSelection && selectedMethod && (
        <div className="mt-8" role="status" aria-live="polite" aria-atomic="true">
          <div className={cn(
            'flex items-center justify-center gap-3 p-4',
            'bg-orange-500/10 border border-orange-500/30 rounded-xl',
            'animate-in fade-in slide-in-from-bottom-2 duration-300'
          )}>
            <span className="text-2xl" aria-hidden="true">
              {selectedMethod.icon}
            </span>
            <div className="text-left">
              <p className="text-white font-semibold">
                {selectedMethod.title}
              </p>
              <p className="text-orange-200 text-sm">
                {selectedMethod.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info in Development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded-lg">
          <summary className="text-xs text-gray-400 cursor-pointer">
            Debug Info
          </summary>
          <div className="mt-2 text-xs text-gray-400 space-y-1">
            <p>Mode: {isControlled ? 'Controlled' : 'Uncontrolled'}</p>
            <p>Selected: {currentValue || 'none'}</p>
            <p>Available methods: {availableMethods.length}/{config.methods.length}</p>
            <p>Allow deselect: {allowDeselect ? 'Yes' : 'No'}</p>
          </div>
        </details>
      )}
    </div>
  );
}