'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Component for demonstrating creation of various notification types
 * This component can be used for testing integration
 */
export default function NotificationActions() {
  const {
    createOfferReceivedNotification,
    createOfferAcceptedNotification,
    createIncomingDeliveryNotification,
    createStatusUpdateNotification,
    createCustomNotification,
  } = useNotifications();

  const [isLoading, setIsLoading] = useState(false);

  // === NOTIFICATION CREATION HANDLERS ===

  const handleCreateOfferReceived = async () => {
    setIsLoading(true);
    try {
      await createOfferReceivedNotification({
        senderId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1', // In real app taken from auth
        deliveryId: 1,
        pickerName: 'Ivan Petrov',
        price: 25,
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOfferAccepted = async () => {
    setIsLoading(true);
    try {
      await createOfferAcceptedNotification({
        senderId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',
        deliveryId: 1,
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIncomingDelivery = async () => {
    setIsLoading(true);
    try {
      await createIncomingDeliveryNotification({
        recipientId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',
        deliveryId: 2,
        senderName: 'Anna Koval',
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStatusUpdate = async () => {
    setIsLoading(true);
    try {
      await createStatusUpdateNotification({
        userId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',
        deliveryId: 1,
        status: 'picked_up',
        message: 'The picker has collected your package and is heading to the recipient.',
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustom = async () => {
    setIsLoading(true);
    try {
      await createCustomNotification({
        user_id: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1',
        title: 'Special Offer',
        message: 'We have a special offer for you!',
        type: 'new_delivery',
        read: false,
        related_delivery_id: 3,
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Actions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Button to create new offer notification */}
        <button
          onClick={handleCreateOfferReceived}
          disabled={isLoading}
          className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          💼 Create &quot;New Offer&quot;
        </button>

        {/* Button to create offer accepted notification */}
        <button
          onClick={handleCreateOfferAccepted}
          disabled={isLoading}
          className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ✅ Create &quot;Offer Accepted&quot;
        </button>

        {/* Button to create incoming delivery notification */}
        <button
          onClick={handleCreateIncomingDelivery}
          disabled={isLoading}
          className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📥 Create &quot;Incoming Delivery&quot;
        </button>

        {/* Button to create status update notification */}
        <button
          onClick={handleCreateStatusUpdate}
          disabled={isLoading}
          className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📦 Create &quot;Status Update&quot;
        </button>

        {/* Button to create custom notification */}
        <button
          onClick={handleCreateCustom}
          disabled={isLoading}
          className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed md:col-span-2 transition-colors"
        >
          🔔 Create Custom Notification
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Creating notification...</span>
        </div>
      )}
    </div>
  );
}