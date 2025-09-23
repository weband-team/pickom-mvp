'use client';

import { useCallback, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhoneWrapper from '../components/PhoneWrapper';
import NavigationWrapper from '../components/NavigationWrapper';
import DeliveryMethodSelector from '../components/DeliveryMethodSelector';
import { useSelectedMethod, useDeliveryActions } from '../hooks/use-delivery-store';
import { DeliveryMethodType } from '../types/delivery';

/**
 * Delivery Methods Page
 * Entry point for selecting delivery method before package details
 * Uses React 19 features like useTransition for better UX
 */
export default function DeliveryMethodsPage() {
  const router = useRouter();
  const selectedMethod = useSelectedMethod();
  const { setSelectedMethod, resetAndClearStorage } = useDeliveryActions();
  const [isPending, startTransition] = useTransition();

  // Clear any persisted state when component mounts to ensure clean start
  useEffect(() => {
    resetAndClearStorage();
  }, [resetAndClearStorage]);

  const handleMethodChange = useCallback((method: DeliveryMethodType | null) => {
    setSelectedMethod(method);
  }, [setSelectedMethod]);

  const handleContinue = useCallback(() => {
    if (selectedMethod) {
      // Use React 19 startTransition for smoother navigation
      startTransition(() => {
        router.push(`/send-package?type=${selectedMethod}`);
      });
    }
  }, [selectedMethod, router]);

  const getInstructionText = () => {
    if (isPending) {
      return "Loading package details...";
    }
    if (selectedMethod) {
      return "You can now proceed to enter package details";
    }
    return "Please select a delivery method to continue";
  };

  const getInstructionStyles = () => {
    if (isPending) {
      return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
    if (selectedMethod) {
      return 'bg-green-500/10 border-green-500/30 text-green-400';
    }
    return 'bg-gray-800/50 border-gray-600 text-gray-400';
  };

  return (
    <PhoneWrapper>
      <div className="page">
        {/* Status Bar */}
        <StatusBar />

        {/* Content */}
        <div className="content">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="title-main">Pickom</h1>
            <p className="subtitle">People-Powered Delivery</p>
            <h2 className="title-section">Send a Package</h2>
          </header>

          {/* Main Content */}
          <main className="mb-8">
            <DeliveryMethodSelector
              value={selectedMethod}
              onChange={handleMethodChange}
              className="mb-6"
              showStatus={true}
              allowDeselect={true}
            />
          </main>

          {/* Instructions */}
          <section className="mb-8" aria-live="polite" aria-atomic="true">
            <div className={`
              p-4 rounded-xl text-center text-sm border transition-all duration-300
              ${getInstructionStyles()}
            `}>
              {getInstructionText()}
            </div>
          </section>

          {/* Action Area */}
          <footer className="pb-safe">
            {selectedMethod ? (
              <button
                onClick={handleContinue}
                disabled={isPending}
                className={`
                  btn-primary transition-all duration-300
                  ${isPending ? 'opacity-50 cursor-wait' : ''}
                `}
                aria-label="Continue to package details"
                aria-busy={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Loading...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            ) : (
              <div className="w-full p-4 text-center text-gray-500 bg-gray-800/30 border border-gray-700 rounded-2xl">
                Select a delivery method to continue
              </div>
            )}
          </footer>
        </div>

        <NavigationWrapper />
      </div>
    </PhoneWrapper>
  );
}

/**
 * Status Bar Component
 * Extracted for cleaner code organization
 */
function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="status-icons">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="white">
          <path d="M1 5.5C1 3.5 2.5 2 4.5 2S8 3.5 8 5.5 6.5 9 4.5 9 1 7.5 1 5.5z" />
          <path d="M9 5.5C9 3.5 10.5 2 12.5 2S16 3.5 16 5.5 14.5 9 12.5 9 9 7.5 9 5.5z" />
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="white">
          <rect x="1" y="1" width="22" height="9" rx="2" stroke="white" strokeWidth="1" fill="none" />
          <rect x="2" y="2" width="18" height="7" fill="white" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Loading Spinner Component
 * Simple CSS-based spinner for loading states
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}