import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; 
import { PushNotifications } from '@capacitor/push-notifications';
import { environment } from '../assets/environment';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private firebaseApp = initializeApp(environment.firebase);
  private messaging = getMessaging(this.firebaseApp);

  constructor() {}

  async initPushNotifications() {
      if (!Capacitor.isNativePlatform()) return;
      
    console.log('🔄 Initializing Firebase Push Notifications...');

    document.addEventListener('deviceready', async () => {
      console.log('📱 Device is ready. Requesting push notification permissions...');

      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        console.log('✅ Push notification permission granted.');
        await PushNotifications.register();
      } else {
        console.warn('❌ Push notification permission denied.');
        return;
      }

      PushNotifications.addListener('registration', (token) => {
        console.log('📲 Push Registration Token:', token.value);
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('⚠️ Push registration error:', err);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('🔔 Notification received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('🛠️ Notification action performed:', action);
      });

      // Fetch and log FCM Token
      this.getFCMToken();
    });
  }

  private async getFCMToken() {
    try {
      const fcmToken = await getToken(this.messaging, {
        vapidKey: 'YOUR_VAPID_PUBLIC_KEY',
      });

      if (fcmToken) {
        console.log('🚀 Firebase Cloud Messaging (FCM) Token:', fcmToken);
      } else {
        console.warn('⚠️ No FCM token available.');
      }
    } catch (error) {
      console.error('🔥 Error fetching FCM token:', error);
    }

    // Handle foreground push notifications
    onMessage(this.messaging, (payload) => {
      console.log('📩 Foreground message received:', payload);
    });
  }
}
