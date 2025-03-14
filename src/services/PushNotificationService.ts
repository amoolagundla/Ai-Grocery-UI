import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, firstValueFrom } from 'rxjs';
import { environment } from '../assets/environment';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private apiUrl = environment.apiUrl;
  private hasInitialized = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Listen for auth state changes
    this.authService.user$.subscribe(user => {
      if (user && !this.hasInitialized) {
        this.initPushNotifications();
      }
    });
  }

  async initPushNotifications(): Promise<string | undefined> {
    // Skip if already initialized or not on native platform
    if (this.hasInitialized || !Capacitor.isNativePlatform()) {
     // console.log('Skipping push notifications: Already initialized or not native platform');
      return undefined;
    }
  
    console.log('🔄 Initializing Push Notifications...');
  
    try {
      // Check if the device is ready
      if (document.readyState === 'complete') {
        return await this.setupPushNotifications();
      } else {
        return new Promise((resolve) => {
          document.addEventListener('deviceready', async () => {
            const token = await this.setupPushNotifications();
            resolve(token);
          });
        });
      }
    } catch (error) {
      //  console.error('Error initializing push notifications:', error);
      return undefined;
    }
  }
  
  private async setupPushNotifications(): Promise<string | undefined> {
    //  console.log('📱 Device is ready. Requesting push notification permissions...');
  
    try {
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        //  console.log('✅ Push notification permission granted.');
        await PushNotifications.register();
        
        // Set up all listeners
        this.setupNotificationListeners();
        // Get the token immediately
        return new Promise<string>((resolve) => {
          PushNotifications.addListener('registration', token => {
            resolve(token.value);
          });
        });
      } else {
         // console.warn('❌ Push notification permission denied.');
        return undefined;
      }
    } catch (error) {
       // console.error('Error setting up push notifications:', error);
      return undefined;
    }
  }

  private setupNotificationListeners() {
    // Handle token registration
    PushNotifications.addListener('registration', async (token) => {
      //  console.log('📲 Push Registration Token:', token.value);
      await this.saveToken(token.value);
    });

    PushNotifications.addListener('registrationError', (err) => {
      //  console.error('⚠️ Push registration error:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
     //   console.log('🔔 Notification received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
     //   console.log('🛠️ Notification action performed:', action);
    });
  }

  private async saveToken(token: string) {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user?.email) {
         // console.warn('⚠️ No user email available to save token');
        return;
      }
      
      const payload = {
        UserEmail: user.email.toLowerCase(),
        Token: token,
        Platform: Capacitor.getPlatform() // Dynamically get platform
      };

       // console.log('📤 Sending push token:', payload);
      
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/push-token`, payload, {
          headers: { 'Content-Type': 'application/json' }
        }).pipe(
          catchError(error => {
           //   console.error('🔥 Error saving push token:', error);
            throw error;
          })
        )
      );

      //  console.log('✅ Push token saved successfully:', response);
    } catch (error) {
      //  console.error('🔥 Error in saveToken:', error);
    }
  }
}