#!/bin/bash

# Fix delivery-details/[id]/PageClient.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/delivery-details/[id]/PageClient.tsx
sed -i 's/color={getStatusColor(delivery.status) as any}/color={getStatusColor(delivery.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}/g' app/delivery-details/[id]/PageClient.tsx

# Fix delivery-methods/[id]/offers/PageClient.tsx
sed -i "s/Don't forget/Don\&apos;t forget/g" app/delivery-methods/[id]/offers/PageClient.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/delivery-methods/[id]/offers/PageClient.tsx

# Fix my-offers/page.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/my-offers/page.tsx
sed -i 's/color={getStatusColor(offer.delivery.status) as any}/color={getStatusColor(offer.delivery.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}/g' app/my-offers/page.tsx

# Fix notifications/page.tsx
sed -i 's/(n: any)/(n)/g' app/notifications/page.tsx

# Fix orders/page.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/orders/page.tsx
sed -i 's/color={getStatusColor(order.status) as any}/color={getStatusColor(order.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}/g' app/orders/page.tsx

# Fix orders/[id]/offers/PageClient.tsx
sed -i "s/Don't forget/Don\&apos;t forget/g" app/orders/[id]/offers/PageClient.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/orders/[id]/offers/PageClient.tsx

# Fix orders/[id]/PageClient.tsx
sed -i 's/onChange={(e: any)/onChange={(e/g' app/orders/[id]/PageClient.tsx
sed -i 's/color={getStatusColor(delivery.status) as any}/color={getStatusColor(delivery.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}/g' app/orders/[id]/PageClient.tsx

# Fix picker-results/page.tsx
sed -i 's/(result: any)/(result)/g' app/picker-results/page.tsx

# Fix profile/page.tsx
sed -i 's/(field: any)/(field)/g' app/profile/page.tsx

# Fix rate-picker/[deliveryId]/PageClient.tsx
sed -i 's/(field: any)/(field)/g' app/rate-picker/[deliveryId]/PageClient.tsx

# Fix rate-sender/[deliveryId]/PageClient.tsx
sed -i 's/(field: any)/(field)/g' app/rate-sender/[deliveryId]/PageClient.tsx

# Fix components/chat/TabbedChat.tsx
sed -i 's/receiverChats.map((chat: any)/receiverChats.map((chat/g' components/chat/TabbedChat.tsx
sed -i 's/senderChats.map((chat: any)/senderChats.map((chat/g' components/chat/TabbedChat.tsx

# Fix components/offer/OfferCard.tsx
sed -i 's/"Accept" button/\&quot;Accept\&quot; button/g' components/offer/OfferCard.tsx

# Fix components/picker/EditPickerCardModal.tsx
sed -i 's/(e: any)/(e)/g' components/picker/EditPickerCardModal.tsx

echo "✅ All remaining files fixed!"
