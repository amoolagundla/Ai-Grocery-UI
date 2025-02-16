import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'; 
import { environment } from '../assets/environment';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private googleClientId = environment.googleClientId; // Store your Google Client ID in environment.ts

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.handleCredentialResponse = this.handleCredentialResponse.bind(this);

    // Initialize Capacitor Google Auth for mobile
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: this.googleClientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }

  /**
   * Load the Google Sign-In script for the web platform.
   */
  async loadGoogleAuth(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      // Skip loading the web script for mobile
      return;
    }

    return new Promise((resolve, reject) => {
      if (document.getElementById('google-jssdk')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-jssdk';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Sign-In script loaded.');
        google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: this.handleCredentialResponse,
        });
        resolve();
      };

      script.onerror = () => {
        console.error('Google Sign-In script failed to load.');
        reject();
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Handle Google Sign-In for both web and mobile platforms.
   */
  async signIn() {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Google Auth for mobile
      try {
        const googleUser = await GoogleAuth.signIn();
        console.log('Google User (Mobile):', googleUser);
        this.authService.setUser(googleUser);
        this.router.navigate(['/purchases']);
      } catch (error) {
        console.error('Google Sign-In Error (Mobile):', error);
      }
    } else {
      // Use web-based Google Sign-In
      this.renderGoogleButton();
    }
  }

  /**
   * Handle the Google Sign-In response for the web platform.
   */
  handleCredentialResponse(response: any) {
    console.log('Google Auth Response (Web):', response);
    const credential = response.credential;
    if (credential) {
      const userInfo = this.parseJwt(credential);
      console.log('User Info (Web):', userInfo);
      this.authService.setUser(userInfo);
      this.router.navigate(['/purchases']);
    }
  }

  /**
   * Parse a JWT token to extract user information.
   */
  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  /**
   * Render the Google Sign-In button for the web platform.
   */
  renderGoogleButton() {
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large' }
    );
  }

  /**
   * Sign out the user from Google.
   */
  async signOut() {
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Google Auth for mobile
      await GoogleAuth.signOut();
    } else {
      // Use web-based Google Sign-In
      google.accounts.id.disableAutoSelect();
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}