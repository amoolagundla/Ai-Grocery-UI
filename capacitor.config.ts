import type { CapacitorConfig } from '@capacitor/cli';
import { environment } from './src/assets/environment';

const config: CapacitorConfig = {
  appId: 'com.AI.AIGroceryApp',
  appName: 'AI-Grocery-APP',
  webDir: 'dist/browser', 
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: environment.googleClientId, // Use the same client ID
      serverClientId: environment.googleClientId, // Use the same client ID
      clientId :environment.googleClientId, 
      forceCodeForRefreshToken: true,      
    },
 
  StatusBar: {
      "overlaysWebView": false,
      "style": "DARK",
      "backgroundColor": "#ffffff"
    }
  },
};

export default config;
