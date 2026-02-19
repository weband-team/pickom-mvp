const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'pickom-client/app/delivery-details/[id]/page.tsx',
  'pickom-client/app/delivery-methods/[id]/offers/page.tsx',
  'pickom-client/app/orders/[id]/offers/page.tsx',
  'pickom-client/app/orders/[id]/page.tsx',
  'pickom-client/app/profile/[uid]/page.tsx',
  'pickom-client/app/rate-picker/[deliveryId]/page.tsx',
  'pickom-client/app/rate-sender/[deliveryId]/page.tsx',
  'pickom-client/app/earnings/top-up/page.tsx',
  'pickom-client/app/package-type/page.tsx',
  'pickom-client/app/hooks/useNotifications.ts',
  'pickom-client/app/chat/[id]/ChatPageClient.tsx',
  'pickom-client/app/register/page.tsx',
  'pickom-client/app/login/page.tsx',
  'pickom-client/app/page.tsx',
  'pickom-client/app/components/NotificationActions.tsx',
  'pickom-client/components/order/ReceiverSelector.tsx',
  'pickom-client/components/DualLocationPicker.tsx',
  'pickom-client/components/LocationPicker.tsx',
  'pickom-client/components/chat/TabbedChat.tsx',
  'pickom-client/components/common/ErrorBoundary.tsx',
];

let totalRemoved = 0;
const modifiedFiles = [];

filesToProcess.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Count console statements
  const consoleMatches = content.match(/console\.(log|error|warn|info)/g);
  const count = consoleMatches ? consoleMatches.length : 0;

  if (count === 0) {
    return;
  }

  // Remove console.error statements but keep the rest of the error handling
  content = content.replace(/(\s*)console\.error\([^;]+\);?\n?/g, '');

  // Remove console.log statements
  content = content.replace(/(\s*)console\.log\([^;]+\);?\n?/g, '');

  // Remove console.warn statements
  content = content.replace(/(\s*)console\.warn\([^;]+\);?\n?/g, '');

  // Remove console.info statements
  content = content.replace(/(\s*)console\.info\([^;]+\);?\n?/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalRemoved += count;
    modifiedFiles.push({ file, count });
    console.log(`✓ ${file}: Removed ${count} console statements`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total console statements removed: ${totalRemoved}`);
console.log(`Files modified: ${modifiedFiles.length}`);
console.log(`\nModified files:`);
modifiedFiles.forEach(({ file, count }) => {
  console.log(`  - ${file} (${count} statements)`);
});
