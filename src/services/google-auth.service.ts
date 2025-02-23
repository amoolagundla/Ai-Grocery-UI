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
  private googleClientId = environment.googleClientId;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.handleCredentialResponse = this.handleCredentialResponse.bind(this);

    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: this.googleClientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }

  async loadGoogleAuth(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
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

  async signIn() {
    if (Capacitor.isNativePlatform()) {
      try {
        const googleUser = await GoogleAuth.signIn();
        console.log('Google User (Mobile):', googleUser);
        
        // Include the ID token in the user object
        const userWithToken = {
          ...googleUser,
          credential: googleUser.authentication.idToken
        };
        
        this.authService.setUser(userWithToken);
        this.router.navigate(['/purchases']);
      } catch (error) {
        console.error('Google Sign-In Error (Mobile):', error);
      }
    } else {
      this.renderGoogleButton();
    }
  }

  handleCredentialResponse(response: any) {
    console.log('Google Auth Response (Web):', response);
    const credential = response.credential;
    if (credential) {
      const userInfo = this.parseJwt(credential);
      // Include the credential (token) in the user info
      userInfo.credential = credential;
      this.authService.setUser(userInfo);
      this.router.navigate(['/purchases']);
    }
  }

  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  renderGoogleButton() {
    google.accounts.id.renderButton(
      document.getElementById('googleSignInButton'),
      { theme: 'outline', size: 'large' }
    );
  }

  async signOut() {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut();
    } else {
      google.accounts.id.disableAutoSelect();
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}