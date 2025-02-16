import type { CapacitorConfig } from '@capacitor/cli';
import { environment } from './src/assets/environment';

const config: CapacitorConfig = {
  appId: 'com.AI.AIGroceryApp',
  appName: 'AI-Grocery-APP',
  webDir: 'dist/browser',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: environment.googleClientId, // Use the same client ID
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
