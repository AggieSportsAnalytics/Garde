import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gardeai.app",
  appName: "Garde",
  server: {
    url: process.env.NEXT_PUBLIC_BASE_URL,
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email", "openid"],
      iosClientId: process.env.NEXT_PUBLIC_IOS_GOOGLE_CLIENT_ID,
      clientId: process.env.NEXT_PUBLIC_IOS_GOOGLE_CLIENT_ID,
      forceCodeForRefreshToken: true
    }
  }
};

export default config;