import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pickom.io',
  appName: 'Pickom',
  webDir: 'out',

  // Server configuration - loads from production hosting
  server: {
    url: 'https://pickom.qirelab.com',
    // cleartext not needed for HTTPS
  },

  // Android specific configuration
  android: {
    allowMixedContent: true,
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF9500',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
