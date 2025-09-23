'use client';

import { Picker } from '../types/picker';
import { DeliveryInfo } from '../types/chat';

interface PickerInfoHeaderProps {
  picker: Picker;
  deliveryInfo: DeliveryInfo;
}

export function PickerInfoHeader({ picker, deliveryInfo }: PickerInfoHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-xl font-semibold text-gray-600">
            {picker.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>

        {/* Picker Info & Delivery Details */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {picker.name}
          </h2>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Route:</span>
              <span className="ml-2">{deliveryInfo.pickupAddress} → {deliveryInfo.dropoffAddress}</span>
            </div>

            <div className="flex items-center">
              <span className="font-medium">Time:</span>
              <span className="ml-2">{deliveryInfo.pickupTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agreed Price */}
      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Agreed Price:</span>
          <span className="text-lg font-bold text-orange-600">{deliveryInfo.agreedPrice} zł</span>
        </div>
      </div>
    </div>
  );
}