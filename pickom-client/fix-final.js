#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  // delivery-details/[id]/PageClient.tsx:125
  {
    file: 'app/delivery-details/[id]/PageClient.tsx',
    from: 'setDelivery(deliveryData as any);',
    to: 'setDelivery(deliveryData);'
  },
  // delivery-methods/[id]/offers/PageClient.tsx:101
  {
    file: 'app/delivery-methods/[id]/offers/PageClient.tsx',
    from: 'setDelivery(deliveryData as any);',
    to: 'setDelivery(deliveryData);'
  },
  // delivery-methods/[id]/offers/PageClient.tsx:487 - apostrophe
  {
    file: 'app/delivery-methods/[id]/offers/PageClient.tsx',
    from: /Don't forget/g,
    to: "Don&apos;t forget"
  },
  // my-offers/page.tsx:63
  {
    file: 'app/my-offers/page.tsx',
    from: 'setOffers(offersData as any);',
    to: 'setOffers(offersData);'
  },
  // my-offers/page.tsx:308
  {
    file: 'app/my-offers/page.tsx',
    from: /color={getStatusColor\(offer\.delivery\.status\) as any}/g,
    to: 'color={getStatusColor(offer.delivery.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}'
  },
  // notifications/page.tsx:44
  {
    file: 'app/notifications/page.tsx',
    from: /notifications\.sort\(\(a: any, b: any\)/,
    to: 'notifications.sort((a, b)'
  },
  // orders/page.tsx:33
  {
    file: 'app/orders/page.tsx',
    from: 'setOrders(ordersData as any);',
    to: 'setOrders(ordersData);'
  },
  // orders/page.tsx:79,80
  {
    file: 'app/orders/page.tsx',
    from: /sortedAndFiltered\.sort\(\(a: any, b: any\)/,
    to: 'sortedAndFiltered.sort((a, b)'
  },
  // orders/[id]/offers/PageClient.tsx:101
  {
    file: 'app/orders/[id]/offers/PageClient.tsx',
    from: 'setDelivery(deliveryData as any);',
    to: 'setDelivery(deliveryData);'
  },
  // orders/[id]/offers/PageClient.tsx:487
  {
    file: 'app/orders/[id]/offers/PageClient.tsx',
    from: /Don't forget/g,
    to: "Don&apos;t forget"
  },
  // orders/[id]/PageClient.tsx:31
  {
    file: 'app/orders/[id]/PageClient.tsx',
    from: 'setDelivery(deliveryData as any);',
    to: 'setDelivery(deliveryData);'
  },
  // orders/[id]/PageClient.tsx:113,114
  {
    file: 'app/orders/[id]/PageClient.tsx',
    from: /sortedAndFiltered\.sort\(\(a: any, b: any\)/,
    to: 'sortedAndFiltered.sort((a, b)'
  },
  // picker-results/page.tsx:46
  {
    file: 'app/picker-results/page.tsx',
    from: /(pickerResults: any)/,
    to: '(pickerResults)'
  },
  // profile/page.tsx:22
  {
    file: 'app/profile/page.tsx',
    from: /\(data: any\)/,
    to: '(data)'
  },
  // rate-picker/[deliveryId]/PageClient.tsx:30
  {
    file: 'app/rate-picker/[deliveryId]/PageClient.tsx',
    from: /\(review: any\)/,
    to: '(review)'
  },
  // rate-sender/[deliveryId]/PageClient.tsx:30
  {
    file: 'app/rate-sender/[deliveryId]/PageClient.tsx',
    from: /\(review: any\)/,
    to: '(review)'
  },
  // components/chat/TabbedChat.tsx:38,56
  {
    file: 'components/chat/TabbedChat.tsx',
    from: /\(chat: any\)/g,
    to: '(chat)'
  },
  // components/offer/OfferCard.tsx:149
  {
    file: 'components/offer/OfferCard.tsx',
    from: /Press "Accept"/g,
    to: 'Press &quot;Accept&quot;'
  },
  // components/picker/EditPickerCardModal.tsx:164
  {
    file: 'components/picker/EditPickerCardModal.tsx',
    from: /\(event: any\)/,
    to: '(event)'
  },
];

let totalFixed = 0;

fixes.forEach(({ file, from, to }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  if (from instanceof RegExp) {
    content = content.replace(from, to);
  } else {
    content = content.replace(from, to);
  }

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    totalFixed++;
  }
});

console.log(`\n🎉 Total files fixed: ${totalFixed}`);
