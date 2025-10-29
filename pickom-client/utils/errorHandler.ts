import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // API error with response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // HTTP status errors
    if (error.response?.status === 401) {
      return 'Authentication required. Please log in.';
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'Resource not found.';
    }
    if (error.response?.status === 429) {
      return 'Too many requests. Please try again later.';
    }
    if (error.response?.status !== undefined && error.response.status >= 500)  {
      return 'Server error. Please try again later.';
    }

    // Network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
  }

  // Generic Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle error with toast notification
 */
export function handleError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  toast.error(message);
  console.error('Error:', error);
}

/**
 * Handle success with toast notification
 */
export function handleSuccess(message: string): void {
  toast.success(message);
}

/**
 * Show loading toast and return toast ID for later updates
 */
export function showLoading(message: string): string {
  return toast.loading(message);
}

/**
 * Update a loading toast to success
 */
export function updateToSuccess(toastId: string, message: string): void {
  toast.success(message, { id: toastId });
}

/**
 * Update a loading toast to error
 */
export function updateToError(toastId: string, error: unknown): void {
  const message = getErrorMessage(error);
  toast.error(message, { id: toastId });
}

/**
 * Handle async operation with automatic toast updates
 */
export async function handleAsyncWithToast<T>(
  operation: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
): Promise<T> {
  const toastId = toast.loading(messages.loading);

  try {
    const result = await operation;
    toast.success(messages.success, { id: toastId });
    return result;
  } catch (error) {
    const errorMessage = messages.error || getErrorMessage(error);
    toast.error(errorMessage, { id: toastId });
    throw error;
  }
}

/**
 * Validation error handler for forms
 */
export function handleValidationError(
  field: string,
  message: string
): void {
  toast.error(`${field}: ${message}`, {
    icon: '⚠️',
  });
}
