import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gardeai.app',
  appName: 'Garde',
  // webDir: 'dist',
  server: {
    url: 'https://gardeai.com',
    cleartext: true,
  },
};

export default config;