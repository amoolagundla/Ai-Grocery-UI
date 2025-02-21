import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private apiUrl = 'https://ocr-function-ai-grocery-bxgke3bjaedhckaz.eastus-01.azurewebsites.net/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async initPushNotifications() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not a native platform, skipping push notifications');
      return;
    }

    console.log('🔄 Initializing Push Notifications...');
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

      // Handle token registration
      PushNotifications.addListener('registration', async (token) => {
        console.log('📲 Push Registration Token:', token.value);
        await this.saveToken(token.value);
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
    });
  }

  private async saveToken(token: string) {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user?.email) {
        console.warn('⚠️ No user email available to save token');
        return;
      }
  
      const payload = {
        UserEmail: user.email.toLowerCase(),  // Normalize email
        Token: token,
        Platform: 'android'  // or 'ios'
      };
  
      console.log('📤 Sending push token:', payload);
  
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/push-token`, payload, {
          headers: { 'Content-Type': 'application/json' }  // Explicitly set JSON headers
        }).pipe(
          catchError(error => {
            console.error('🔥 Error saving push token:', error);
            throw error;
          })
        )
      );
  
      console.log('✅ Push token saved successfully:', response);
    } catch (error) {
      console.error('🔥 Error in saveToken:', error);
    }
  }
  
}