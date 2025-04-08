import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gardeai.app',
  appName: 'Garde',
  // webDir: 'dist',
  server: {
    url: 'https://gardeai.com',
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email", "openid"],
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      forceCodeForRefreshToken: true
    }
  }
};

export default config;