import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

/**
 * Initialize Capacitor plugins and configure mobile-specific settings
 * Call this once when the app starts (in root layout or _app)
 */
export async function initializeCapacitor() {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  const platform = Capacitor.getPlatform();

  // Initialize Status Bar (Android only)
  if (platform === 'android') {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FF9500' }); // Pickom orange
    } catch {
      // StatusBar plugin not available
    }
  }

  // Initialize Keyboard
  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: true });

    // Listen to keyboard events
    Keyboard.addListener('keyboardWillShow', (info) => {
      // Keyboard will show
    });

    Keyboard.addListener('keyboardWillHide', () => {
      // Keyboard will hide
    });
  } catch {
    // Keyboard plugin not available
  }

  // Initialize App listeners
  try {
    App.addListener('appStateChange', ({ isActive }) => {
      // App state changed
    });
  } catch {
    // App plugin not available
  }

  // Initialize Network monitoring
  try {
    Network.addListener('networkStatusChange', (status) => {
      // Network status changed
    });

    const networkStatus = await Network.getStatus();
  } catch {
    // Network plugin not available
  }
}

/**
 * Check if app is running on native platform
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get platform name (ios, android, web)
 */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/**
 * Cleanup Capacitor listeners (call on unmount if needed)
 */
export function cleanupCapacitor() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    Keyboard.removeAllListeners();
  } catch {
    // Keyboard cleanup failed
  }

  try {
    App.removeAllListeners();
  } catch {
    // App cleanup failed
  }

  try {
    Network.removeAllListeners();
  } catch {
    // Network cleanup failed
  }
}
