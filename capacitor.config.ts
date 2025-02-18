import type { CapacitorConfig } from '@capacitor/cli';
import { environment } from './src/assets/environment';

const config: CapacitorConfig = {
  appId: 'com.AI.AIGroceryApp',
  appName: 'AI-Grocery-APP',
  webDir: 'dist/browser',
  // server: {
  //   androidScheme: 'http',
  //   url: 'http://192.168.100.185:4200',
  //   cleartext: true,
  // },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      androidClientId: environment.googleClientId, // Use the same client ID
      serverClientId: environment.googleClientId, // Use the same client ID
      clientId :environment.googleClientId, 
      forceCodeForRefreshToken: true,      
    },
  },
};

export default config;
