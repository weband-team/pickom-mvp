#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific file fixes
const fileSpecificFixes = {
  'app/components/NotificationActions.tsx': [
    { from: 'Review "Delivered"', to: 'Review &quot;Delivered&quot;' },
    { from: 'Review "Picked Up"', to: 'Review &quot;Picked Up&quot;' },
    { from: 'Review "Accepted"', to: 'Review &quot;Accepted&quot;' },
    { from: 'Review "Cancelled"', to: 'Review &quot;Cancelled&quot;' },
  ],
  'app/delivery-methods/[id]/offers/PageClient.tsx': [
    { from: "Don't forget", to: "Don&apos;t forget" },
    { from: ' as any', to: ' as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'' },
  ],
  'app/orders/[id]/offers/PageClient.tsx': [
    { from: "Don't forget", to: "Don&apos;t forget" },
    { from: ' as any', to: ' as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'' },
  ],
  'components/offer/OfferCard.tsx': [
    { from: '"Accept" button', to: '&quot;Accept&quot; button' },
    { from: ' as any', to: ' as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'' },
  ],
  'app/delivery-details/[id]/PageClient.tsx': [
    { from: 'onChange={(e: any)', to: 'onChange={(e)' },
    { from: 'color={getStatusColor(delivery.status) as any}', to: 'color={getStatusColor(delivery.status) as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'}' },
  ],
  'app/my-offers/page.tsx': [
    { from: 'onChange={(e: any)', to: 'onChange={(e)' },
    { from: 'color={getStatusColor(offer.delivery.status) as any}', to: 'color={getStatusColor(offer.delivery.status) as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'}' },
  ],
  'app/notifications/page.tsx': [
    { from: '(n: any)', to: '(n)' },
  ],
  'app/orders/page.tsx': [
    { from: 'onChange={(e: any)', to: 'onChange={(e)' },
    { from: 'color={getStatusColor(order.status) as any}', to: 'color={getStatusColor(order.status) as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'}' },
  ],
  'app/orders/[id]/PageClient.tsx': [
    { from: 'onChange={(e: any)', to: 'onChange={(e)' },
    { from: 'color={getStatusColor(delivery.status) as any}', to: 'color={getStatusColor(delivery.status) as \'default\' | \'primary\' | \'secondary\' | \'error\' | \'info\' | \'success\' | \'warning\'}' },
  ],
  'app/picker-results/page.tsx': [
    { from: '(result: any)', to: '(result)' },
  ],
  'app/profile/page.tsx': [
    { from: '(field: any)', to: '(field)' },
  ],
  'app/rate-picker/[deliveryId]/PageClient.tsx': [
    { from: '(field: any)', to: '(field)' },
  ],
  'app/rate-sender/[deliveryId]/PageClient.tsx': [
    { from: '(field: any)', to: '(field)' },
  ],
  'components/chat/TabbedChat.tsx': [
    { from: 'receiverChats.map((chat: any)', to: 'receiverChats.map((chat)' },
    { from: 'senderChats.map((chat: any)', to: 'senderChats.map((chat)' },
  ],
  'components/picker/EditPickerCardModal.tsx': [
    { from: '(e: any)', to: '(e)' },
  ],
};

let totalFixed = 0;

Object.entries(fileSpecificFixes).forEach(([file, fixes]) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  fixes.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      fileFixed++;
    }
  });

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\n🎉 Total issues fixed: ${totalFixed}`);
