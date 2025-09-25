import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DeliveryMethodType, DeliveryMethod, DELIVERY_METHODS } from '../types/delivery';

/**
 * Delivery State Shape
 */
interface DeliveryState {
  selectedMethod: DeliveryMethodType | null;
  deliveryDetails: {
    pickupLocation?: string;
    dropoffLocation?: string;
    pickupTime?: Date;
    notes?: string;
  };
  history: DeliveryMethodType[];
  isSearchingPickers: boolean;
}

/**
 * Delivery Store Actions
 */
interface DeliveryActions {
  // Selection actions
  setSelectedMethod: (method: DeliveryMethodType | null) => void;
  toggleMethod: (method: DeliveryMethodType) => void;
  clearSelection: () => void;

  // Detail actions
  setDeliveryDetails: (details: Partial<DeliveryState['deliveryDetails']>) => void;
  clearDeliveryDetails: () => void;

  // Helper getters
  isMethodSelected: (method: DeliveryMethodType) => boolean;
  hasSelection: () => boolean;
  getSelectedMethodData: () => DeliveryMethod | null;
  canProceed: () => boolean;

  // History actions
  addToHistory: (method: DeliveryMethodType) => void;
  clearHistory: () => void;

  // Picker search actions
  startPickerSearch: () => void;
  stopPickerSearch: () => void;

  // Reset actions
  reset: () => void;
  resetAndClearStorage: () => void;
}

/**
 * Combined Store Type
 */
type DeliveryStore = DeliveryState & DeliveryActions;

/**
 * Initial State
 */
const initialState: DeliveryState = {
  selectedMethod: null,
  deliveryDetails: {},
  history: [],
  isSearchingPickers: false
};

/**
 * Zustand Store with middleware for better DX
 * - immer for immutable updates
 * - devtools for debugging
 * - persist for local storage (optional)
 */
export const useDeliveryStore = create<DeliveryStore>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          // State
          ...initialState,

          // Selection actions
          setSelectedMethod: (method) => set((state) => {
            state.selectedMethod = method;
            if (method) {
              // Add to history if not already there
              if (!state.history.includes(method)) {
                state.history.push(method);
              }
            }
          }),

          toggleMethod: (method) => set((state) => {
            if (state.selectedMethod === method) {
              state.selectedMethod = null;
            } else {
              state.selectedMethod = method;
              if (!state.history.includes(method)) {
                state.history.push(method);
              }
            }
          }),

          clearSelection: () => set((state) => {
            state.selectedMethod = null;
          }),

          // Detail actions
          setDeliveryDetails: (details) => set((state) => {
            state.deliveryDetails = {
              ...state.deliveryDetails,
              ...details
            };
          }),

          clearDeliveryDetails: () => set((state) => {
            state.deliveryDetails = {};
          }),

          // Helper getters (not reactive, use carefully)
          isMethodSelected: (method) => {
            return get().selectedMethod === method;
          },

          hasSelection: () => {
            return get().selectedMethod !== null;
          },

          getSelectedMethodData: () => {
            const selected = get().selectedMethod;
            return selected ? DELIVERY_METHODS[selected] : null;
          },

          canProceed: () => {
            const state = get();
            return state.selectedMethod !== null &&
                   state.deliveryDetails.pickupLocation !== undefined &&
                   state.deliveryDetails.dropoffLocation !== undefined;
          },

          // History actions
          addToHistory: (method) => set((state) => {
            if (!state.history.includes(method)) {
              state.history.push(method);
              // Keep only last 5 items
              if (state.history.length > 5) {
                state.history = state.history.slice(-5);
              }
            }
          }),

          clearHistory: () => set((state) => {
            state.history = [];
          }),

          // Picker search actions
          startPickerSearch: () => set((state) => {
            state.isSearchingPickers = true;
          }),

          stopPickerSearch: () => set((state) => {
            state.isSearchingPickers = false;
          }),

          // Reset actions
          reset: () => set(() => initialState),

          resetAndClearStorage: () => {
            // Clear localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('delivery-store');
            }
            // Reset state
            set(() => initialState);
          }
        }),
        {
          name: 'delivery-store',
          // Only persist selected method and history
          partialize: (state) => ({
            selectedMethod: state.selectedMethod,
            history: state.history
          })
        }
      )
    ),
    {
      name: 'DeliveryStore'
    }
  )
);

/**
 * Selector hooks for better performance
 * These prevent unnecessary re-renders by subscribing to specific state slices
 */
export const useSelectedMethod = () => useDeliveryStore((state) => state.selectedMethod);
export const useDeliveryDetails = () => useDeliveryStore((state) => state.deliveryDetails);
export const useDeliveryHistory = () => useDeliveryStore((state) => state.history);
export const useIsSearchingPickers = () => useDeliveryStore((state) => state.isSearchingPickers);

export const useDeliveryActions = () => {
  const setSelectedMethod = useDeliveryStore((state) => state.setSelectedMethod);
  const toggleMethod = useDeliveryStore((state) => state.toggleMethod);
  const clearSelection = useDeliveryStore((state) => state.clearSelection);
  const setDeliveryDetails = useDeliveryStore((state) => state.setDeliveryDetails);
  const clearDeliveryDetails = useDeliveryStore((state) => state.clearDeliveryDetails);
  const startPickerSearch = useDeliveryStore((state) => state.startPickerSearch);
  const stopPickerSearch = useDeliveryStore((state) => state.stopPickerSearch);
  const reset = useDeliveryStore((state) => state.reset);
  const resetAndClearStorage = useDeliveryStore((state) => state.resetAndClearStorage);

  return {
    setSelectedMethod,
    toggleMethod,
    clearSelection,
    setDeliveryDetails,
    clearDeliveryDetails,
    startPickerSearch,
    stopPickerSearch,
    reset,
    resetAndClearStorage
  };
};