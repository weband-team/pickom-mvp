#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to fix
const fixes = [
  // Fix: catch (err: any) => catch
  { pattern: /catch\s*\(\s*err\s*:\s*any\s*\)/g, replacement: 'catch' },
  { pattern: /catch\s*\(\s*error\s*:\s*any\s*\)/g, replacement: 'catch' },
  { pattern: /catch\s*\(\s*e\s*:\s*any\s*\)/g, replacement: 'catch' },

  // Fix unused catch variables
  { pattern: /catch\s*\(\s*err\s*\)\s*{/g, replacement: 'catch {' },
  { pattern: /catch\s*\(\s*error\s*\)\s*{/g, replacement: 'catch {' },
  { pattern: /catch\s*\(\s*e\s*\)\s*{/g, replacement: 'catch {' },
];

// Files to process
const filesToFix = [
  'app/available-deliveries/page.tsx',
  'app/browse-senders/page.tsx',
  'app/chat/[id]/ChatPageClient.tsx',
  'app/chats/page.tsx',
  'app/components/NotificationActions.tsx',
  'app/delivery-details/[id]/PageClient.tsx',
  'app/delivery-methods/page.tsx',
  'app/delivery-methods/[id]/offers/PageClient.tsx',
  'app/earnings/cancelled/page.tsx',
  'app/earnings/completed/page.tsx',
  'app/earnings/page.tsx',
  'app/earnings/top-up/page.tsx',
  'app/earnings/top-up/success/page.tsx',
  'app/login/page.tsx',
  'app/my-offers/page.tsx',
  'app/notifications/page.tsx',
  'app/orders/page.tsx',
  'app/orders/[id]/edit/PageClient.tsx',
  'app/orders/[id]/offers/PageClient.tsx',
  'app/orders/[id]/PageClient.tsx',
  'app/package-type/page.tsx',
  'app/page.tsx',
  'app/picker-results/page.tsx',
  'app/profile/edit/page.tsx',
  'app/profile/page.tsx',
  'app/profile/[uid]/PageClient.tsx',
  'app/rate-picker/[deliveryId]/PageClient.tsx',
  'app/rate-sender/[deliveryId]/PageClient.tsx',
  'app/register/page.tsx',
  'components/chat/TabbedChat.tsx',
  'components/DualLocationPicker.tsx',
  'components/LocationPicker.tsx',
  'components/offer/OfferCard.tsx',
  'components/order/ReceiverSelector.tsx',
  'components/picker/EditPickerCardModal.tsx',
  'lib/capacitor-init.ts',
];

let totalFixed = 0;

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixed = 0;

  fixes.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileFixed += matches.length;
    }
  });

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
});

console.log(`\n🎉 Total issues fixed: ${totalFixed}`);
