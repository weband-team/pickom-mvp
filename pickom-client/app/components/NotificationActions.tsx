'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Компонент для демонстрации создания различных типов уведомлений
 * Этот компонент можно использовать для тестирования интеграции
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

  // === ОБРАБОТЧИКИ СОЗДАНИЯ УВЕДОМЛЕНИЙ ===

  const handleCreateOfferReceived = async () => {
    setIsLoading(true);
    try {
      await createOfferReceivedNotification({
        senderId: 'X43wZP2lAdNA9GyhMxxRjd4rQPg1', // В реальном приложении берется из auth
        deliveryId: 1,
        pickerName: 'Иван Петров',
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
        senderName: 'Анна Коваль',
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
        message: 'Курьер забрал вашу посылку и направляется к получателю.',
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
        title: 'Специальное предложение',
        message: 'У нас есть специальное предложение для вас!',
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
        Действия с уведомлениями
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Кнопка для создания уведомления о новом предложении */}
        <button
          onClick={handleCreateOfferReceived}
          disabled={isLoading}
          className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          💼 Создать &quot;Новое предложение&quot;
        </button>

        {/* Кнопка для создания уведомления о принятии предложения */}
        <button
          onClick={handleCreateOfferAccepted}
          disabled={isLoading}
          className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ✅ Создать &quot;Предложение принято&quot;
        </button>

        {/* Кнопка для создания уведомления о входящей доставке */}
        <button
          onClick={handleCreateIncomingDelivery}
          disabled={isLoading}
          className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📥 Создать &quot;Входящая доставка&quot;
        </button>

        {/* Кнопка для создания уведомления об обновлении статуса */}
        <button
          onClick={handleCreateStatusUpdate}
          disabled={isLoading}
          className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📦 Создать &quot;Обновление статуса&quot;
        </button>

        {/* Кнопка для создания кастомного уведомления */}
        <button
          onClick={handleCreateCustom}
          disabled={isLoading}
          className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed md:col-span-2 transition-colors"
        >
          🔔 Создать кастомное уведомление
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Создание уведомления...</span>
        </div>
      )}
    </div>
  );
}