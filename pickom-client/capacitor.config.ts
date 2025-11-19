import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pickom.io',
  appName: 'Pickom',
  webDir: 'out',

  // Development server configuration
  // Uncomment to use dev server, comment out to use static build from 'out/' directory
  server: {
    // Point to your local dev server
    //url: 'http://10.0.2.2:3000',
    url: 'http://192.168.100.28:3000',
    cleartext: true,
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
