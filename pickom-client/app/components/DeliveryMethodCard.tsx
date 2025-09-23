'use client';

import { memo, useMemo } from 'react';
import { DeliveryMethod } from '../types/delivery';
import { cn } from '../utils/cn';

interface DeliveryMethodCardProps {
  method: DeliveryMethod;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: (methodId: string) => void;
  className?: string;
}

/**
 * Delivery Method Card Component
 * A reusable card component for displaying delivery method options with proper accessibility
 */
const DeliveryMethodCard = memo<DeliveryMethodCardProps>(({
  method,
  isSelected,
  isDisabled = false,
  onSelect,
  className = ''
}) => {
  // Memoize computed values for performance
  const isInteractive = useMemo(
    () => !isDisabled && method.isAvailable,
    [isDisabled, method.isAvailable]
  );

  const handleInteraction = () => {
    if (isInteractive) {
      onSelect(method.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleInteraction();
    }
  };

  // Use semantic HTML and data attributes for better styling control
  return (
    <article
      className={cn(
        // Base styles
        'relative w-full p-6 rounded-2xl border-2',
        'transition-all duration-300 ease-in-out',
        'min-h-[120px] flex flex-col justify-center items-center text-center',
        'select-none touch-manipulation',

        // Interactive states
        isInteractive && [
          'cursor-pointer',
          'hover:border-orange-400 hover:bg-gray-800/70',
          'hover:scale-[1.02] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-orange-500 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-black'
        ],

        // Selected state
        isSelected && [
          'bg-gradient-to-br from-orange-500/20 to-orange-600/10',
          'border-orange-500 text-white',
          'shadow-lg shadow-orange-500/25 scale-105'
        ],

        // Default state
        !isSelected && isInteractive && [
          'bg-gray-900/50 border-gray-600 text-gray-300',
          'hover:text-white'
        ],

        // Disabled state
        !isInteractive && [
          'opacity-50 cursor-not-allowed',
          'bg-gray-800 border-gray-600 text-gray-400'
        ],

        className
      )}
      onClick={isInteractive ? handleInteraction : undefined}
      onKeyDown={handleKeyDown}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={!isInteractive}
      aria-label={`${method.title} - ${method.subtitle}`}
      tabIndex={isInteractive ? 0 : -1}
      data-testid={`delivery-method-${method.id}`}
      data-selected={isSelected}
      data-available={method.isAvailable}
    >
      {/* Icon */}
      <div
        className="text-4xl mb-3"
        role="img"
        aria-hidden="true"
      >
        {method.icon}
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-xl font-bold mb-1',
        isSelected && 'text-white'
      )}>
        {method.title}
      </h3>

      {/* Subtitle */}
      <p className={cn(
        'text-sm mb-2',
        isSelected ? 'text-orange-100' : 'text-gray-400'
      )}>
        {method.subtitle}
      </p>

      {/* Description */}
      <p className={cn(
        'text-xs',
        isSelected ? 'text-orange-200' : 'text-gray-500'
      )}>
        {method.description}
      </p>

      {/* Availability Badge */}
      {!method.isAvailable && (
        <div
          className="mt-2 px-2 py-1 bg-red-600/20 border border-red-500/30 rounded-md"
          role="status"
          aria-live="polite"
        >
          <span className="text-xs text-red-400 font-medium">Coming Soon</span>
        </div>
      )}
    </article>
  );
});

DeliveryMethodCard.displayName = 'DeliveryMethodCard';

export default DeliveryMethodCard;